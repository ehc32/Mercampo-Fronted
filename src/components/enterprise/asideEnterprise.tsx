import { useState, useRef, ChangeEvent, useEffect } from 'react';
import { FaFacebookF, FaWhatsapp, FaInstagram, FaEnvelope, FaPhoneAlt, FaMapMarkerAlt, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import Map from './Map';
import './style.css';
import { compressImage } from '../../utils/imageUtils';
import { update_enterprise } from '../../api/users';
import { Tooltip } from '@mui/material';

interface AsideEnterpriseProps {
    enterpriseData: any;
    onUpdate: () => void; 
}

const AsideEnterprise = ({ enterpriseData, onUpdate }: AsideEnterpriseProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: enterpriseData?.enterprise.name || '',
        description: enterpriseData?.enterprise.description || '',
        phone: enterpriseData?.enterprise.phone || '',
        address: enterpriseData?.enterprise.address || '',
        tipo_productos: enterpriseData?.enterprise.tipo_productos || '',
        facebook: enterpriseData?.enterprise.facebook || '',
        instagram: enterpriseData?.enterprise.instagram || '',
        whatsapp: enterpriseData?.enterprise.whatsapp || '',
        link_enterprise: enterpriseData?.enterprise.link_enterprise || '',
        avatar: enterpriseData?.enterprise.avatar || ''
    });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const decodeJWT = (token: string) => {
            try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
            );
            return JSON.parse(jsonPayload);
            } catch (error) {
            console.error('Error decoding JWT:', error);
            return null;
            }
        };
        
        const [currentUserId, setCurrentUserId] = useState<number | null>(null);
        
        useEffect(() => {
            // Obtener el objeto auth del localStorage
            const authData = localStorage.getItem('auth');
            if (authData) {
            try {
                const auth = JSON.parse(authData);
                if (auth?.state?.access) {
                const decoded = decodeJWT(auth.state.access);
                if (decoded?.user_id) {
                    setCurrentUserId(decoded.user_id);
                }
                }
            } catch (error) {
                console.error('Error parsing auth data:', error);
            }
            }
        }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            try {
                // Comprimir la imagen antes de convertir a base64
                const compressedFile = await compressImage(e.target.files[0], {
                    quality: 0.7,
                    maxWidth: 800,
                    maxHeight: 800
                });
                
                const reader = new FileReader();
                reader.onloadend = () => {
                    setFormData(prev => ({
                        ...prev,
                        avatar: reader.result as string
                    }));
                };
                reader.readAsDataURL(compressedFile);
            } catch (err) {
                console.error("Error al procesar imagen:", err);
                setError("Error al procesar la imagen. Intenta con otra.");
            }
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);
        setSuccess(null);
        
        try {
            // Convertir tipo_productos a array si viene como string
            const tipoProductos = formData.tipo_productos.includes(',') 
                ? formData.tipo_productos.split(',').map((item: string) => item.trim())
                : [formData.tipo_productos];
            
            await update_enterprise(enterpriseData.owner.id, {
                ...formData,
                tipo_productos: tipoProductos
            });
            
            setSuccess("Empresa actualizada correctamente");
            setIsEditing(false);
            onUpdate(); // Llama al callback para actualizar los datos
        } catch (err) {
            console.error("Error al actualizar empresa:", err);
            setError("Error al actualizar la empresa. Intenta nuevamente.");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setFormData({
            name: enterpriseData?.enterprise.name || '',
            description: enterpriseData?.enterprise.description || '',
            phone: enterpriseData?.enterprise.phone || '',
            address: enterpriseData?.enterprise.address || '',
            tipo_productos: enterpriseData?.enterprise.tipo_productos || '',
            facebook: enterpriseData?.enterprise.facebook || '',
            instagram: enterpriseData?.enterprise.instagram || '',
            whatsapp: enterpriseData?.enterprise.whatsapp || '',
            link_enterprise: enterpriseData?.enterprise.link_enterprise || '',
            avatar: enterpriseData?.enterprise.avatar || ''
        });
        setError(null);
    };

    return (
        <aside className="enterprise-sidebar">
            <div className="sidebar-content">
                {/* Botón de edición */}
                <div className="edit-button-container mt-8 mx-8">
                    {currentUserId === enterpriseData?.owner.id && (
                        isEditing ? (
                            <div className="edit-actions">
                                <button 
                                    onClick={handleSubmit} 
                                    className="save-button"
                                    disabled={loading}
                                >
                                    {loading ? 'Guardando...' : (
                                        <>
                                            <FaSave /> Guardar
                                        </>
                                    )}
                                </button>
                                <button 
                                    onClick={handleCancel} 
                                    className="cancel-button"
                                    disabled={loading}
                                >
                                    <FaTimes /> Cancelar
                                </button>
                            </div>
                        ) : (
                            <button 
                                onClick={() => setIsEditing(true)} 
                                className="edit-button"
                            >
                                <FaEdit /> Editar empresa
                            </button>
                        )
                    )}
                </div>

                {/* Mensajes de estado */}
                {error && <div className="alert error">{error}</div>}
                {success && <div className="alert success">{success}</div>}

                {/* Encabezado con logo */}
                <div className="enterprise-header">
                    <div className="enterprise-logo-container">
                        <img
                            src={formData.avatar || "./../../../public/logoSena.png"}
                            alt="Logo de la empresa"
                            className="enterprise-logo"
                        />
                        {isEditing && (
                            <div className="avatar-upload">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageChange}
                                    className="edit-mode-input"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                />
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="change-avatar-button"
                                >
                                    Cambiar logo
                                </button>
                                <p className="avatar-hint">(Recomendado: 800x800 px, max 2MB)</p>
                            </div>
                        )}
                    </div>
                    
                    {isEditing ? (
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="edit-mode-input"
                            placeholder="Nombre de la empresa"
                        />
                    ) : (
                        <h2 className="enterprise-name">{formData.name || "Nombre de la Empresa"}</h2>
                    )}
                    
                    <p className="enterprise-leader">Líder: {enterpriseData?.owner.name || "Maria del Pilar"}</p>
                </div>

                {/* Descripción */}
                <div className="enterprise-description">
                    {isEditing ? (
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            className="edit-mode-input"
                            placeholder="Descripción de la empresa"
                            rows={4}
                        />
                    ) : (
                        <p>{formData.description || "Café Brisa Andina es una empresa dedicada a la producción y comercialización de café 100% orgánico..."}</p>
                    )}
                </div>
                
                {/* Tipo de productos */}
                <div className="enterprise-section">
                    <h3 className="section-title">Tipo de productos</h3>
                    <div className="product-type">
                        <FaEnvelope className="section-icon" />
                        {isEditing ? (
                            <input
                                type="text"
                                name="tipo_productos"
                                value={formData.tipo_productos}
                                onChange={handleInputChange}
                                className="edit-mode-input"
                                placeholder="Separados por comas (ej: Café, Panela, Miel)"
                            />
                        ) : (
                            <span>{formData.tipo_productos || "Café"}</span>
                        )}
                    </div>
                </div>
                
                {/* Contacto */}
                <div className="enterprise-contact">
                    <h3 className="section-title">Contacto</h3>

                    <div className="social-links">
                        {isEditing ? (
                            <>
                                <div className="social-input">
                                    <FaFacebookF className="social-icon" />
                                    <input
                                        type="text"
                                        name="facebook"
                                        value={formData.facebook}
                                        onChange={handleInputChange}
                                        className="edit-mode-input"
                                        placeholder="URL de Facebook"
                                    />
                                </div>
                                <div className="social-input">
                                    <FaInstagram className="social-icon" />
                                    <input
                                        type="text"
                                        name="instagram"
                                        value={formData.instagram}
                                        onChange={handleInputChange}
                                        className="edit-mode-input"
                                        placeholder="URL de Instagram"
                                    />
                                </div>
                                <div className="social-input">
                                    <FaWhatsapp className="social-icon" />
                                    <input
                                        type="text"
                                        name="whatsapp"
                                        value={formData.whatsapp}
                                        onChange={handleInputChange}
                                        className="edit-mode-input"
                                        placeholder="Número de WhatsApp"
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                <Tooltip 
                                    title="Facebook"
                                    arrow
                                    placement="bottom"
                                    componentsProps={{
                                    tooltip: {
                                        sx: {
                                        bgcolor: '#3b5998', // Color azul de Facebook
                                        color: 'white',
                                        fontSize: '0.8rem',
                                        '& .MuiTooltip-arrow': {
                                            color: '#3b5998',
                                        },
                                        }
                                    }
                                    }}
                                >
                                    <a
                                    href={formData.facebook || "https://facebook.com"}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="social-link facebook"
                                    >
                                    <FaFacebookF className="social-icon" />
                                    </a>
                                </Tooltip>

                                <Tooltip 
                                    title="Instagram"
                                    arrow
                                    placement="bottom"
                                    componentsProps={{
                                    tooltip: {
                                        sx: {
                                        bgcolor: '#E1306C', // Color rosa de Instagram
                                        color: 'white',
                                        fontSize: '0.8rem',
                                        '& .MuiTooltip-arrow': {
                                            color: '#E1306C',
                                        },
                                        }
                                    }
                                    }}
                                >
                                    <a
                                    href={formData.instagram || "https://instagram.com"}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="social-link instagram"
                                    >
                                    <FaInstagram className="social-icon" />
                                    </a>
                                </Tooltip>

                                <Tooltip 
                                    title="WhatsApp"
                                    arrow
                                    placement="bottom"
                                    componentsProps={{
                                    tooltip: {
                                        sx: {
                                        bgcolor: '#25D366', // Color verde de WhatsApp
                                        color: 'white',
                                        fontSize: '0.8rem',
                                        '& .MuiTooltip-arrow': {
                                            color: '#25D366',
                                        },
                                        }
                                    }
                                    }}
                                >
                                    <a
                                    href={`https://wa.me/${formData.whatsapp}` || "https://wa.me/1234567890"}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="social-link whatsapp"
                                    >
                                    <FaWhatsapp className="social-icon" />
                                    </a>
                                </Tooltip>
                                </>
                        )}
                    </div>

                    <div className="contact-info">
                        <div className="contact-item">
                            <FaEnvelope className="contact-icon" />
                            <span>{enterpriseData?.owner.email || "ncerquera5@soy.sena.edu.co"}</span>
                        </div>
                        {isEditing ? (
                            <div className="contact-input">
                                <FaPhoneAlt className="contact-icon" />
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="edit-mode-input"
                                    placeholder="Teléfono de contacto"
                                />
                            </div>
                        ) : (
                            <a 
                                className="contact-item" 
                                href={formData.whatsapp || "https://wa.me/1234567890"}
                                target="_blank"
                            >
                                <FaPhoneAlt className="contact-icon" />
                                <span>{formData.phone || "+57 3132316909"}</span>
                            </a>
                        )}
                        {isEditing ? (
                            <div className="contact-input">
                                <FaMapMarkerAlt className="contact-icon" />
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    className="edit-mode-input"
                                    placeholder="Dirección de la empresa"
                                />
                            </div>
                        ) : (
                            <div className="contact-item">
                                <FaMapMarkerAlt className="contact-icon" />
                                <span>{formData.address || "Neiva, Huila"}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mapa */}
                <div className="enterprise-map">
                    <Map address={formData.address || 'neiva'} />
                </div>
            </div>
        </aside>
    );
};

export default AsideEnterprise;