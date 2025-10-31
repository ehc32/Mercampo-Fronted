// Card.jsx (componente hijo)
import { FaFacebookF, FaWhatsapp, FaInstagram, FaGlobe } from 'react-icons/fa';
import { Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom'; 
import './Card.css';

const EmpresaCard = (emp) => {
    const empresa = emp.empresa;
    const navigate = useNavigate(); 

    const handleConocerMas = () => {
        navigate(`/myEnterprise/${empresa.owner_user}`);
    };

    return (
        <div className="empresa-card">
            <div className="card-image-container">
                <img
                    src={empresa.avatar || "https://via.placeholder.com/150"}
                    alt={`Logo de ${empresa.name}`}
                    className="card-image"
                />
            </div>
            <div className="card-content">
                <div className="card-header">
                    <h2 className="card-title">{empresa.name}</h2>
                    <p className="card-address">{empresa.address}</p>
                </div>
                <div className="card-description-container">
                    <p className="card-description">
                        {empresa.description}
                    </p>  
                </div>
                <div className="card-footer">
                    <div className="social-icons">
                        <Tooltip title="Facebook" arrow>
                            <a href={empresa.facebook} target="_blank" rel="noopener noreferrer" className="social-icon">
                                <FaFacebookF className="facebook-icon" />
                            </a>
                        </Tooltip>
                        <Tooltip title="WhatsApp" arrow>
                            <a href={`https://wa.me/${empresa.whatsapp}`} target="_blank" rel="noopener noreferrer" className="social-icon">
                                <FaWhatsapp className="whatsapp-icon" />
                            </a>
                        </Tooltip>
                        <Tooltip title="Instagram" arrow>
                            <a href={empresa.instagram} target="_blank" rel="noopener noreferrer" className="social-icon">
                                <FaInstagram className="instagram-icon" />
                            </a>
                        </Tooltip>
                        <Tooltip title="Página Web" arrow>
                            <a href={empresa.link_enterprise} target="_blank" rel="noopener noreferrer" className="social-icon">
                                <FaGlobe className="website-icon" />
                            </a>
                        </Tooltip>
                    </div>
                    <button 
                        onClick={handleConocerMas}
                        className="know-more-btn"
                    >
                        Conocer más
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EmpresaCard;