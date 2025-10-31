import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import './styles.css'
import { useEffect, useMemo, useState } from 'react';
import { get_google_maps_config } from '../../../api/maps'

interface locationStatus {
    address: string;
}

// Componente interno que carga el mapa con una API key ya disponible
const LoadedMap: React.FC<{ address: string; apiKey: string }> = ({ address, apiKey }) => {
    const { isLoaded, loadError } = useJsApiLoader({ id: 'google-maps-script', googleMapsApiKey: apiKey });

    const [lat, setLat] = useState(0);
    const [lng, setLng] = useState(0);

    const geocodeAddress = async () => {
        const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`);
        const data = await response.json();
        if (data.results.length > 0) {
            const coordinates = data.results[0].geometry.location;
            setLat(coordinates.lat);
            setLng(coordinates.lng);
        }
    };

    useEffect(() => {
        geocodeAddress();
    }, [address]);

    if (loadError) {
        return <div>Error al cargar el mapa</div>;
    }

    if (!isLoaded) {
        return <div>Cargando...</div>;
    }

    return (
        <section className="sectionMap">
            <h2 className='titulo-sala-compra-light'>Localización</h2>
            <h4 className='sub-titulo-sala-compra-light'>Encuentra lo que te gusta de manera eficiente</h4>
            <div style={{ width: '100%', height: '360px', borderRadius: 12, overflow: 'hidden' }}>
                <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '100%' }}
                    center={{ lat: lat || 4.711, lng: lng || -74.0721 }}
                    zoom={15}
                    options={{ streetViewControl: false, mapTypeControl: false, fullscreenControl: false }}
                >
                    {lat && lng && (
                        <Marker position={{ lat, lng }} />
                    )}
                </GoogleMap>
            </div>
        </section>
    );
};

const Map: React.FC<locationStatus> = ({ address }) => {
    const [apiKey, setApiKey] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchKey = async () => {
            try {
                const res = await get_google_maps_config()
                if (!res.api_key) {
                    setError('La API Key de Google Maps no está configurada')
                } else {
                    setApiKey(res.api_key)
                }
            } catch (e) {
                setError('No se pudo cargar la configuración de Google Maps')
            }
        }
        fetchKey()
    }, [])

    if (error) return <div className="px-2 text-sm text-red-600">{error}</div>
    if (!apiKey) return <div className="px-2 text-sm">Cargando mapa...</div>

    return <LoadedMap address={address} apiKey={apiKey} />
}

export default Map;