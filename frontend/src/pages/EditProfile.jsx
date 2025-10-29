// src/pages/EditProfile.jsx
import React, { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import '../styles/EditProfile.css'

export default function EditProfile() {
  const { user, updateProfile, uploadAvatar, deleteAvatar } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [avatarPreview, setAvatarPreview] = useState(null)
  
  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    birthDate: user?.birthDate ? user.birthDate.split('T')[0] : '',
    location: user?.location || '',
    phone: user?.phone || '',
    website: user?.website || '',
    bio: user?.bio || '',
    interests: user?.interests?.join(', ') || ''
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'La imagen debe ser menor a 5MB' })
        return
      }
      
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: 'Solo se permiten archivos de imagen' })
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarPreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAvatarUpload = async () => {
    const file = fileInputRef.current?.files[0]
    if (!file) return

    setLoading(true)
    try {
      await uploadAvatar(file)
      setMessage({ type: 'success', text: 'Foto de perfil actualizada correctamente' })
      setAvatarPreview(null)
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Error al subir la imagen' })
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarDelete = async () => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar tu foto de perfil?')) return

    setLoading(true)
    try {
      await deleteAvatar()
      setMessage({ type: 'success', text: 'Foto de perfil eliminada' })
      setAvatarPreview(null)
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al eliminar la imagen' })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    setLoading(true)
    try {
      const processedData = {
        ...profileData,
        birthDate: profileData.birthDate || null,
        interests: profileData.interests 
          ? profileData.interests.split(',').map(item => item.trim()).filter(Boolean)
          : []
      }
      
      await updateProfile(processedData)
      setMessage({ type: 'success', text: 'Perfil actualizado correctamente' })
      
      // Redirect to profile after successful update
      setTimeout(() => {
        navigate('/profile')
      }, 2000)
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Error al actualizar el perfil' })
    } finally {
      setLoading(false)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="edit-profile-container">
      <div className="edit-header">
        <Link to="/profile" className="back-button">
          <span role="img" aria-label="volver">⬅️</span>
          Volver al Perfil
        </Link>
        <h1>Editar Perfil</h1>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          <span role="img" aria-label={message.type === 'success' ? 'Éxito' : 'Error'} style={{fontSize:'1.2em'}}>{message.type === 'success' ? '✅' : '⚠️'}</span>
          {message.text}
          <button onClick={() => setMessage({ type: '', text: '' })}>×</button>
        </div>
      )}

      <div className="edit-content">
        <div className="avatar-section">
          <div className="avatar-container">
            <div className="avatar-display">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Preview" />
              ) : user?.avatar ? (
                <img src={user.avatar} alt="Avatar" />
              ) : (
                <span role="img" aria-label="Usuario" style={{fontSize:'2em'}}>👤</span>
              )}
            </div>
            
            <div className="avatar-actions">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: 'none' }}
              />
              
              <button 
                className="avatar-button upload" 
                onClick={triggerFileInput}
                disabled={loading}
              >
                <span role="img" aria-label="cámara">📷</span>
                Cambiar Foto
              </button>
              
              {avatarPreview && (
                <button 
                  className="avatar-button save" 
                  onClick={handleAvatarUpload}
                  disabled={loading}
                >
                  <span role="img" aria-label="subir">⬆️</span>
                  Subir
                </button>
              )}
              
              {(user?.avatar || avatarPreview) && (
                <button 
                  className="avatar-button delete" 
                  onClick={handleAvatarDelete}
                  disabled={loading}
                >
                  <span role="img" aria-label="Eliminar">🗑️</span>
                  Eliminar
                </button>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-section">
            <h2>
              <span role="img" aria-label="Usuario" style={{fontSize:'1.2em'}}>👤</span>
              Información Personal
            </h2>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="username">Nombre de Usuario</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={profileData.username}
                  onChange={handleInputChange}
                  placeholder="Tu nombre de usuario único"
                  minLength={3}
                  maxLength={30}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={profileData.email}
                  placeholder="tu@nebulosamagica.com"
                  required
                  readOnly
                  style={{ background: '#f5f5f5', color: '#888', cursor: 'not-allowed' }}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">Nombre</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={profileData.firstName}
                  onChange={handleInputChange}
                  placeholder="Tu nombre"
                  maxLength={50}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="lastName">Apellidos</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={profileData.lastName}
                  onChange={handleInputChange}
                  placeholder="Tus apellidos"
                  maxLength={50}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="birthDate">
                  <span role="img" aria-label="Fecha">📅</span>
                  Fecha de Nacimiento
                </label>
                <input
                  type="date"
                  id="birthDate"
                  name="birthDate"
                  value={profileData.birthDate}
                  onChange={handleInputChange}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="location">
                  <span role="img" aria-label="ubicación">📍</span>
                  Ubicación
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={profileData.location}
                  onChange={handleInputChange}
                  placeholder="Ciudad, País"
                  maxLength={100}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>
              <span role="img" aria-label="correo">✉️</span>
              Información de Contacto
            </h2>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone">
                  <span role="img" aria-label="teléfono">📞</span>
                  Teléfono
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleInputChange}
                  placeholder="+34 600 000 000"
                  maxLength={20}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="website">
                  <span role="img" aria-label="web">🌐</span>
                  Sitio Web
                </label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={profileData.website}
                  onChange={handleInputChange}
                  placeholder="https://tuweb.com"
                  maxLength={200}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>
              <span role="img" aria-label="Editar">✏️</span>
              Sobre Ti
            </h2>
            
            <div className="form-group full-width">
              <label htmlFor="bio">Biografía</label>
              <textarea
                id="bio"
                name="bio"
                value={profileData.bio}
                onChange={handleInputChange}
                placeholder="Cuéntanos algo sobre ti, tus intereses en el mundo esotérico..."
                rows={4}
                maxLength={500}
              />
              <small>{profileData.bio.length}/500 caracteres</small>
            </div>
            
            <div className="form-group full-width">
              <label htmlFor="interests">Intereses</label>
              <input
                type="text"
                id="interests"
                name="interests"
                value={profileData.interests}
                onChange={handleInputChange}
                placeholder="Tarot, Runas, Astrología, Cristales... (separados por comas)"
                maxLength={200}
              />
              <small>Separa tus intereses con comas</small>
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-button"
              onClick={() => navigate('/profile')}
            >
              Cancelar
            </button>
            
            <button 
              type="submit" 
              className="save-button"
              disabled={loading}
            >
              <span role="img" aria-label="Guardar">💾</span>
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}