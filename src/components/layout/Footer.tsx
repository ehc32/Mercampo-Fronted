import { FaFacebook, FaLinkedin, FaTwitter, FaWhatsapp, FaYoutube } from 'react-icons/fa';
import './../../global/style.css';

const Footer = () => {
  return (
    <footer className="bg-[#2A2A2A] shadow py-9 z-0">
      <div className="container  mx-auto px-4">
        <div className="text-center">
          <a href="https://industriaempresayservicios.blogspot.com/p/servicios-tecnologicos.html" target="_blank" rel="noopener noreferrer" className="text-sm block text-[#39A900] font-semibold">
            Servicios Tecnologicos - Regional Huila
          </a>
          <div className="mb-2">
            <p className="force_text_green font-semibold text-[#39A900]">Centro de la Empresa la Industria, la Empresa y los Servicios</p>
            <p className="text-xs text-[#39A900] font-semibold">Carrera 9 No 68-50, SENA - PBX (60 8) 8757040 IP 83352</p>
          </div>
          <div className="flex justify-center space-x-4 mb-2">
            <a href="https://www.facebook.com/SENAHuila" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">
              <FaFacebook size={20} />
            </a>
            <a href="https://x.com/senahuila" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-600">
              <FaTwitter size={20} />
            </a>
            <a href="https://www.youtube.com/@senaneiva2716" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:text-red-800">
              <FaYoutube size={20} />
            </a>
            <a href="https://www.linkedin.com/school/servicio-nacional-de-aprendizaje-sena-/" target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:text-blue-900">
              <FaLinkedin size={20} />
            </a>
            <a href="https://web.whatsapp.com/" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-800">
              <FaWhatsapp size={20} />
            </a>
          </div>
          <div className="text-xs text-[#fff]">&copy; Copyright. Todos los derechos reservados</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;