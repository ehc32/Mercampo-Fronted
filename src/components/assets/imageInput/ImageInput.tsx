import React from 'react';
import { Grid, IconButton, Button } from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import CloseIcon from '@mui/icons-material/Close';

interface ImageInputProps {
    setImages: (images: string[]) => void;
    images: string[];
    img_lenght: number;
    rut?: boolean; // Prop para indicar si es RUT
}

const ImageInput = ({ setImages, images, img_lenght, rut = false }: ImageInputProps) => {

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const reader = new FileReader();
        reader.onload = () => {
            if (reader.result) {
                const img = new Image();
                img.onload = () => {
                    // Si rut es true, no hacer resize
                    if (!rut) {
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');

                        // Dimensiones de recorte
                        const targetWidth = 500;
                        const targetHeight = 300;

                        // Ajusta el canvas al tamaño de recorte
                        canvas.width = targetWidth;
                        canvas.height = targetHeight;

                        // Establece el fondo blanco
                        ctx.fillStyle = 'white';
                        ctx.fillRect(0, 0, canvas.width, canvas.height);

                        // Calcula las coordenadas para recortar la imagen
                        const scale = Math.min(targetWidth / img.width, targetHeight / img.height);
                        const x = (targetWidth / 2) - (scale * img.width / 2);
                        const y = (targetHeight / 2) - (scale * img.height / 2);

                        ctx.drawImage(img, x, y, scale * img.width, scale * img.height);

                        const base64 = canvas.toDataURL('image/jpeg', 0.5); // Calidad 50%
                        setImages((prevImages) => [...prevImages, base64]);
                    } else {
                        // Si es RUT, no redimensionar y usar la imagen tal cual
                        setImages((prevImages) => [...prevImages, reader.result as string]);
                    }
                };
                img.src = reader.result as string;
            }
        };
        const files = event.target.files;
        if (files && files[0]) {
            reader.readAsDataURL(files[0]);
        }
    };

    const handleImageRemove = (index: number) => {
        setImages((prevImages) => prevImages.filter((_, i) => i !== index));
    };

    return (
        <div className='w-full flex flex-wrap'>
            <Grid container spacing={2} style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {images.map((image, index) => (
                    <Grid item xs={4} sm={3} md={2} key={index}>
                        <div style={{ position: 'relative', paddingBottom: '100%' }}>
                            <img
                                src={image}
                                alt=""
                                style={{
                                    width: '150px',
                                    height: '100px',
                                    objectFit: 'cover',
                                    borderRadius: '4px'
                                }}
                            />
                            <IconButton
                                onClick={() => handleImageRemove(index)}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    right: 0,
                                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                    color: 'white',
                                }}
                            >
                                <CloseIcon />
                            </IconButton>
                        </div>
                    </Grid>
                ))}
                {images.length < img_lenght && (
                    <Grid item xs={4} sm={3} md={2}>
                        <Button
                            variant="contained"
                            component="label"
                            style={{
                                width: '150px',
                                height: '100px',
                                borderRadius: '4px',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: 'transparent',
                                border: '1px dashed #39A900',
                            }}
                        >
                            <div className='flex flex-col align-center'>
                                <AddPhotoAlternateIcon className='text-[#30A900]' />
                                <span className='text-[#30A900] fs-12px'>Cargar imagen</span>
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                hidden
                            />
                        </Button>
                    </Grid>
                )}
            </Grid>
        </div>
    );
};

export default ImageInput;
