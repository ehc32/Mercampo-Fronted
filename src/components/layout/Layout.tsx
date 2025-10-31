import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { Outlet } from 'react-router-dom';
import Footer from './Footer';
import Whatsapp from '../shared/WhatsappButton/Whatsapp';
import AsideFilter from '../tienda/AsideFilter/AsideFilter';
import Header from './Header';

const Layout = () => {

  const [estadoAside, setEstadoAside] = useState(false);

  return (
    <div>
      <Toaster />
      <AsideFilter />
      <Header estadoAside={estadoAside} setEstadoAside={setEstadoAside} />
      <div className="pt-14 bg-white dark:bg-gray-900">
        <Outlet />
      </div>
      <Whatsapp />
      <Footer />
    </div>
  )
}

export default Layout
