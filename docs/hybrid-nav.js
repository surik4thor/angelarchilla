// hybrid-nav.js - Navegación híbrida WordPress <-> React

class NebulosHybridNavigator {
    constructor() {
        this.config = window.nebulosa_config || {};
        this.init();
    }
    
    init() {
        // Interceptar enlaces a la app React
        this.setupAppLinks();
        
        // Sincronizar autenticación
        this.syncAuth();
        
        // Mantener estado de usuario
        this.maintainUserState();
    }
    
    setupAppLinks() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('.nebulosa-app-link');
            if (!link) return;
            
            e.preventDefault();
            
            const href = link.getAttribute('href');
            const type = link.dataset.type;
            
            // Verificar si usuario necesita login
            if (this.requiresAuth(type) && !this.isLoggedIn()) {
                this.showLoginModal();
                return;
            }
            
            // Navegar a la app React
            this.navigateToApp(href);
        });
    }
    
    navigateToApp(path) {
        // Preparar token para React
        const token = this.getAuthToken();
        
        if (token) {
            // Guardar token en localStorage para React
            localStorage.setItem('arcanaToken', token);
        }
        
        // Redirigir manteniendo el diseño
        window.location.href = path;
    }
    
    syncAuth() {
        // Si estamos en WordPress y hay usuario logueado
        if (this.config.user_token) {
            // Crear sesión en React API
            fetch(`${this.config.api_url}/auth/wp-sync`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-WP-Nonce': this.config.user_token
                },
                body: JSON.stringify({
                    action: 'sync_session'
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.token) {
                    localStorage.setItem('arcanaToken', data.token);
                }
            })
            .catch(console.error);
        }
    }
    
    maintainUserState() {
        // Actualizar UI basada en estado de usuario
        this.updateUserInterface();
        
        // Polling para mantener sesión activa
        setInterval(() => {
            this.refreshUserData();
        }, 300000); // 5 minutos
    }
    
    updateUserInterface() {
        fetch('/wp-admin/admin-ajax.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'action=nebulosa_get_user_data'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                this.renderUserInfo(data.data);
            }
        })
        .catch(console.error);
    }
    
    renderUserInfo(userData) {
        // Actualizar elementos de UI con datos del usuario
        const userElements = document.querySelectorAll('[data-user-info]');
        
        userElements.forEach(element => {
            const field = element.dataset.userInfo;
            if (userData[field]) {
                element.textContent = userData[field];
            }
        });
        
        // Mostrar/ocultar elementos basados en plan
        const planElements = document.querySelectorAll('[data-plan-required]');
        planElements.forEach(element => {
            const requiredPlan = element.dataset.planRequired;
            const userPlan = userData.subscriptionPlan || 'INVITADO';
            
            if (this.hasAccess(userPlan, requiredPlan)) {
                element.style.display = 'block';
            } else {
                element.style.display = 'none';
            }
        });
    }
    
    hasAccess(userPlan, requiredPlan) {
        const planHierarchy = ['INVITADO', 'INICIADO', 'ADEPTO', 'MAESTRO'];
        const userLevel = planHierarchy.indexOf(userPlan);
        const requiredLevel = planHierarchy.indexOf(requiredPlan);
        
        return userLevel >= requiredLevel;
    }
    
    requiresAuth(type) {
        const authRequired = ['tarot', 'runas', 'dashboard', 'history'];
        return authRequired.includes(type);
    }
    
    isLoggedIn() {
        return document.body.classList.contains('logged-in') || 
               localStorage.getItem('arcanaToken');
    }
    
    getAuthToken() {
        // Intentar obtener token de WordPress o localStorage
        return localStorage.getItem('arcanaToken') || 
               this.config.user_token;
    }
    
    showLoginModal() {
        // Mostrar modal de login de WordPress o redirigir
        const loginUrl = '/wp-login.php?redirect_to=' + encodeURIComponent(window.location.href);
        
        if (confirm('Necesitas iniciar sesión para acceder a esta funcionalidad. ¿Quieres ir al login?')) {
            window.location.href = loginUrl;
        }
    }
    
    refreshUserData() {
        // Verificar si la sesión sigue activa
        const token = this.getAuthToken();
        if (!token) return;
        
        fetch(`${this.config.api_url}/auth/verify`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                // Token expirado, limpiar
                localStorage.removeItem('arcanaToken');
                this.updateUserInterface();
            }
        })
        .catch(console.error);
    }
}

// Inicializar cuando DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new NebulosHybridNavigator();
});

// Funciones globales para compatibilidad
window.NebulosaMagica = {
    navigateToReading: (type) => {
        const navigator = new NebulosHybridNavigator();
        navigator.navigateToApp(`/app/${type}`);
    },
    
    checkUserPlan: () => {
        return new Promise((resolve) => {
            fetch('/wp-admin/admin-ajax.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: 'action=nebulosa_get_user_data'
            })
            .then(response => response.json())
            .then(data => {
                resolve(data.success ? data.data.subscriptionPlan : 'INVITADO');
            })
            .catch(() => resolve('INVITADO'));
        });
    }
};