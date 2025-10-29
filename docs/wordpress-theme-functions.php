<?php
/*
Theme Name: Nebulosa Mágica
Description: Tema WordPress que replica el diseño React
Version: 1.0
*/

// Encolar estilos y scripts compartidos
function nebulosa_enqueue_assets() {
    // CSS principal (exportado desde React)
    wp_enqueue_style('nebulosa-main', get_template_directory_uri() . '/assets/nebulosa-styles.css');
    
    // Scripts para navegación híbrida
    wp_enqueue_script('nebulosa-nav', get_template_directory_uri() . '/assets/hybrid-nav.js', array('jquery'), '1.0', true);
    
    // Variables para JavaScript
    wp_localize_script('nebulosa-nav', 'nebulosa_config', array(
        'react_app_url' => 'https://nebulosamagica.com/app',
        'api_url' => 'https://nebulosamagica.com/api',
        'user_token' => is_user_logged_in() ? wp_create_nonce('user_token') : ''
    ));
}
add_action('wp_enqueue_scripts', 'nebulosa_enqueue_assets');

// Sincronizar usuarios con API React
function sync_wordpress_user_to_react($user_id) {
    $user = get_user_by('id', $user_id);
    
    $response = wp_remote_post(site_url('/api/auth/wp-sync'), array(
        'body' => json_encode(array(
            'email' => $user->user_email,
            'username' => $user->user_login,
            'wp_user_id' => $user_id,
            'subscription_plan' => get_user_meta($user_id, 'subscription_plan', true) ?: 'INVITADO'
        )),
        'headers' => array(
            'Content-Type' => 'application/json',
            'X-WP-Sync-Token' => wp_create_nonce('wp_sync_' . $user_id)
        )
    ));
}

// Hook para registro y login
add_action('wp_login', function($user_login, $user) {
    sync_wordpress_user_to_react($user->ID);
}, 10, 2);

add_action('user_register', 'sync_wordpress_user_to_react');

// Función para obtener productos destacados de WooCommerce
function get_featured_products_for_homepage() {
    if (!function_exists('wc_get_products')) {
        return array();
    }
    
    return wc_get_products(array(
        'status' => 'publish',
        'featured' => true,
        'limit' => 8,
        'orderby' => 'menu_order',
        'order' => 'ASC'
    ));
}

// Shortcode para mostrar botón de lecturas
function nebulosa_reading_button_shortcode($atts) {
    $atts = shortcode_atts(array(
        'type' => 'tarot',
        'text' => 'Comenzar Lectura',
        'class' => 'btn btn-primary'
    ), $atts);
    
    $url = "/app/{$atts['type']}";
    
    return sprintf(
        '<a href="%s" class="%s nebulosa-app-link" data-type="%s">%s</a>',
        esc_url($url),
        esc_attr($atts['class']),
        esc_attr($atts['type']),
        esc_html($atts['text'])
    );
}
add_shortcode('nebulosa_reading', 'nebulosa_reading_button_shortcode');

// AJAX para obtener datos de usuario desde React API
function nebulosa_get_user_data() {
    if (!is_user_logged_in()) {
        wp_send_json_error('Usuario no autenticado');
        return;
    }
    
    $user_id = get_current_user_id();
    $user = get_user_by('id', $user_id);
    
    // Consultar API React para datos de suscripción
    $response = wp_remote_get(site_url('/api/auth/me'), array(
        'headers' => array(
            'Authorization' => 'Bearer ' . get_user_meta($user_id, 'react_token', true)
        )
    ));
    
    if (is_wp_error($response)) {
        wp_send_json_error('Error conectando con API');
        return;
    }
    
    $body = json_decode(wp_remote_retrieve_body($response), true);
    wp_send_json_success($body);
}
add_action('wp_ajax_nebulosa_get_user_data', 'nebulosa_get_user_data');
add_action('wp_ajax_nopriv_nebulosa_get_user_data', 'nebulosa_get_user_data');
?>