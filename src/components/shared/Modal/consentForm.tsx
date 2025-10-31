import React, { useState } from "react";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
} from "@mui/material";
import './Modal.css'

const ConsentModal: React.FC<ConsentModalProps> = ({ open, handleClose, setAccepted, accepted }) => {

    const handleCheckboxChange = () => {
        setAccepted(!accepted);
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogContent>
                <div className="mx-auto p-6 bg-white">
                    <h2 className="text-2xl font-semibold mb-4">Política de Privacidad</h2>
                    <p className="text-gray-700 mb-2">
                        En cumplimiento de la Ley 1581 de 2012 y el Decreto 1377 de 2013, garantiza la protección de los datos personales de los usuarios que interactúan con sus servicios.
                    </p>

                    <div className="flex items-center my-4">
                        <input
                            type="checkbox"
                            id="consent"
                            checked={accepted}
                            className="h-4 w-4 text-[#39A900] focus:ring-[#39A900] border-[#39A900] rounded cursor-pointer"
                            onChange={handleCheckboxChange}
                        />
                        <label htmlFor="consent" className="ml-2 text-gray-700 label-consent">
                            Acepto el tratamiento de mis datos personales.
                        </label>
                    </div>
                    <DialogActions>
                        <Button
                            onClick={handleClose}
                            className={`mt-6 px-4 py-2 font-semibold rounded-lg shadow-md cancel-button text-white cursor-not-allowed`}
                        >
                            Cerrar
                        </Button>
                        {
                            accepted ? (
                                <Button
                                    onClick={handleClose}
                                    className={`mt-6 px-4 py-2 font-semibold rounded-lg shadow-md ok-button text-white cursor-not-allowed`}
                                    disabled={!accepted}
                                >
                                    Aceptar
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleClose}
                                    className={`mt-6 px-4 py-2 font-semibold rounded-lg shadow-md bg-gray-400 text-white cursor-not-allowed`}
                                    disabled={!accepted}
                                >
                                    Aceptar
                                </Button>
                            )
                        }
                    </DialogActions>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ConsentModal;
