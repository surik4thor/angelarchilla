# Configuración de GitHub Pages para angelarchilla.es

1. **Verifica que tu repositorio esté público.**
2. **Sube todos los archivos de tu web al repositorio.**
3. **Crea un archivo `CNAME` en la raíz del repositorio con el contenido:**

angelarchilla.es

4. **Entra a la configuración del repositorio en GitHub:**
   - Ve a "Settings" > "Pages".
   - En "Source", selecciona la rama principal (`main`) y la carpeta raíz (`/`).
   - Guarda los cambios.

5. **Configura los DNS en tu proveedor de dominio:**
   - Añade un registro tipo `A` apuntando a las IPs de GitHub Pages:
     - 185.199.108.153
     - 185.199.109.153
     - 185.199.110.153
     - 185.199.111.153
   - Añade un registro tipo `CNAME` para `www.angelarchilla.es` apuntando a `angelarchilla.github.io` (opcional).

6. **Espera la propagación DNS (puede tardar hasta 24h).**

7. **Accede a tu web en angelarchilla.es.**

---

Si tienes problemas, revisa la sección "Custom domain" en GitHub Pages y asegúrate que el archivo `CNAME` esté correctamente configurado y los DNS apunten a las IPs de GitHub.
