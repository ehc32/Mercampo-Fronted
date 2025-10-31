import './../global/dashlite.css'

interface NotfoundPageProps {
    boton?: boolean;
}

const NotfoundPage = ({ boton = false }: NotfoundPageProps) => {
    return (
        <div className="nk-app-root w-full">
            <div className="nk-main">
                <div className="nk-wrap nk-wrap-nosidebar">
                    <div className="nk-content">
                        <div className="my-auto px-4 sm:px-6 lg:px-8 sm:mx-6"> {/* Added padding */}
                            <div className="text-center">
                                <h1 className="nk-error-head text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4">Recurso no encontrado</h1>
                                <h3 className="nk-error-title text-xl sm:text-2xl md:text-3xl mb-4">Oops! Ha ocurrido un error al encontrar el recurso solicitado.</h3>

                                {
                                    boton ? (
                                        <>
                                            <p className="nk-error-text text-base sm:text-lg">Parece que no existe un producto con esas especificaciones.</p>
                                        </>
                                    ) : (
                                        <>
                                            <p className="nk-error-text text-base sm:text-lg mb-4">Lo sentimos por el inconveniente. Parece que intentaste acceder a una página que no existe o ha sido eliminada.</p>
                                            <a href="/" className="btn btn-lg btn-primary mt-2 inline-block px-6 py-3 text-white bg-blue-600 rounded hover:bg-blue-700">Volver al Inicio</a>
                                        </>
                                    )
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default NotfoundPage;