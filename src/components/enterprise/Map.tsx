import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { useEffect, useState } from 'react';

interface locationStatus {
    address: string;
}

const Map: React.FC<locationStatus> = ({ address }) => {

    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-maps-script',
        googleMapsApiKey: 'AIzaSyDWmh4H4O1AqdP5-nzLJft-EdFo9m6TDk8' // tener en cuenta de que esto puede variar
    });

    const [lat, setLat] = useState(0);
    const [lng, setLng] = useState(0);

    const geocodeAddress = async () => {
        const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=AIzaSyDWmh4H4O1AqdP5-nzLJft-EdFo9m6TDk8`);
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
        <GoogleMap
            mapContainerStyle={{ width: '100%', height: '150px' }}
            center={{ lat: lat, lng: lng }}
            zoom={15}
        >
            {lat && lng && (
                <Marker
                    position={{ lat: lat, lng: lng }}
                    icon={{
                        url: '/public/logoSena.png',
                        scaledSize: new window.google.maps.Size(40, 40),
                    }}
                />
            )}
        </GoogleMap>
    );
};

export default Map;