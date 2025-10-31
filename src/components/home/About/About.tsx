import './styles.css';
import AccordionSet from './../../shared/Accordion/Accordion';
import { useState } from 'react';

export default function Component() {
    const [activeIndex, setActiveIndex] = useState(null);

    return (
        <div className="contenedorabout p-4 " style={{ fontFamily: 'Nunito, sans-serif' }}>
            <section className="w-full h-96 py-32 relative rounded-lg my-10 bg-cover" style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('/public/kkkk.jpeg')` }}>
                <div className="w-full px-2 md:px-6">
                    <div className="max-w-3xl space-y-4 text-start text-primary-foreground">
                        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl" style={{ color: '#fff' }}>
                            Nuestra Plataforma de Comercio
                        </h1>
                        <p className="text-lg md:text-xl text-white text-justify">
                            Somos una plataforma dedicada a conectar a productores y consumidores a través de soluciones innovadoras para mejorar la comercialización.
                        </p>
                    </div>
                    <div className="absolute top-0 right-0 w-1/2 md:w-1/3 lg:w-1/4">
                        <img src="/public/campesena.png" alt="Imagen de campesinos trabajando" className="w-auto h-auto  md:w-72 md:h-72 object-cover rounded-lg shadow-lg" />
                    </div>
                </div>
            </section>

            <div className="w-full flex flex-col lg:flex-row justify-between mt-10 space-y-6 lg:space-y-0 lg:space-x-4">
                <div className="w-full lg:w-[48%] bg-white p-6 rounded-lg shadow-lg">
                    <div className="mb-6">
                        <h3 className="text-24 font-bold mb-2 text-center" style={{ color: '#39A900', fontSize: '24px' }}>
                            Bienvenidos a mercampo
                        </h3>
                        <p className="text-16 text-black text-justify" style={{ fontSize: '16px' }}>
                            En mercampo, nos comprometemos a crear un espacio seguro y transparente donde los productores locales pueden vender sus productos directamente a los consumidores, sin intermediarios. Nuestra misión es apoyar el desarrollo económico de las comunidades rurales y urbanas, promoviendo el comercio justo y sostenible.
                        </p>
                    </div>
                    <div className="mb-6">
                        <h3 className="text-24 font-bold mb-2 text-center" style={{ color: '#39A900', fontSize: '24px' }}>
                            ¿Qué hace que nuestra plataforma sea diferente?
                        </h3>
                        <ul className="listas-beneficios">
                            <li>
                                <div className="flex flex-row align-center">
                                    <p className="text-16 font-bold text-black" style={{ fontSize: '16px' }}>Sin intermediarios</p>
                                    <span className="ml-1">🚫</span>
                                </div>
                                <p className="text-16 text-black text-justify" style={{ fontSize: '16px' }}>En mercampo, los productores pueden vender sus productos directamente a los consumidores, sin tener que pagar comisiones o tarifas a intermediarios.</p>
                            </li>
                            <li>
                                <div className="flex flex-row align-center">
                                    <p className="text-16 font-bold text-black" style={{ fontSize: '16px' }}>Pagos seguros</p>
                                    <span className="ml-1">🔒</span>
                                </div>
                                <p className="text-16 text-black text-justify" style={{ fontSize: '16px' }}>Nuestra plataforma cuenta con integración PayPal, lo que garantiza que las transacciones sean seguras y confiables.</p>
                            </li>
                            <li>
                                <div className="flex flex-row align-center">
                                    <p className="text-16 font-bold text-black" style={{ fontSize: '16px' }}>Acceso a nuevos mercados</p>
                                    <span className=" ml-2">🌐</span>
                                </div>
                                <p className="text-16 text-black text-justify" style={{ fontSize: '16px' }}>Nuestra plataforma conecta a los productores con un amplio mercado de consumidores, lo que les permite expandir su negocio y aumentar sus ventas.</p>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="w-full lg:w-[48%] bg-white p-6 rounded-lg shadow-lg">
                    <h1 className="text-24 font-bold mb-4 text-center" style={{ color: '#39A900', fontSize: '24px' }}>
                        Preguntas Frecuentes
                    </h1>
                    <h2 className="text-16 text-black mb-4 text-center" style={{ fontSize: '16px' }}>
                        Aquí encontrarás respuestas a las preguntas más comunes sobre nuestra plataforma
                    </h2>
                    <AccordionSet
                        titulo="¿Qué es mercampo?"
                        contenido="Somos una plataforma de mercadeo libre que conecta a productores y consumidores, sin intermediarios. Nuestra misión es apoyar el desarrollo económico de las comunidades rurales y urbanas, promoviendo el comercio justo y sostenible."
                        isOpen={activeIndex === 0}
                        onClick={() => setActiveIndex(activeIndex === 0 ? null : 0)}
                    />
                    <AccordionSet
                        titulo="¿Cómo funciona?"
                        contenido="Nuestra plataforma permite a los productores vender sus productos directamente a los consumidores, sin intermediarios. Los pagos se realizan de manera segura a través de PayPal."
                        isOpen={activeIndex === 1}
                        onClick={() => setActiveIndex(activeIndex === 1 ? null : 1)}
                    />
                    <AccordionSet
                        titulo="¿Qué beneficios ofrece?"
                        contenido="Ofrecemos acceso a nuevos mercados, pagos seguros y la oportunidad de vender sus productos a un precio justo."
                        isOpen={activeIndex === 2}
                        onClick={() => setActiveIndex(activeIndex === 2 ? null : 2)}
                    />
                    <AccordionSet
                        titulo="¿Cómo puedo unirme?"
                        contenido="Para unirte a nuestra plataforma, solo debes registrarte con tus datos en la sección de 'Registro' y comenzar a utilizar nuestras herramientas."
                        isOpen={activeIndex === 3}
                        onClick={() => setActiveIndex(activeIndex === 3 ? null : 3)}
                    />
                </div>
            </div>
        </div>
    );
}
