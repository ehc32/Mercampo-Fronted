import { useState } from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Button from "@mui/material/Button";
import { AiOutlineCheck, AiOutlineClose } from "react-icons/ai";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { sendRequestSeller } from './../../../api/users'
import { FaTag } from "react-icons/fa";

const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "#FFFFFF",
    border: "none",
    boxShadow: 24,
    pt: 2,
    px: 4,
    pb: 3,
};

interface ModalRequestSellerProps {
    userId: number | string;
}

export default function ModalRequestSeller({
    userId,
}: ModalRequestSellerProps) {
    const [open, setOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleConfirmOpen = () => {
        sendRequest()
        setOpen(false);
    };

    const sendRequest = async () => {
        try {
            await sendRequestSeller(userId)
            toast.success("Se ha enviado la solicitud, espera a que te aprueben")
        } catch (e) {
            toast.warning("Ya has solicitado ser vendedor, ten paciencia en lo que aceptan tu solicitud")
        }
    }

    return (
        <div>
            <h2
                className="bg-green-700 text-white border border-green-700 hover:bg-green-800 mx-2 my-1 p-3 rounded   row align-center w-56 justify-center"
                onClick={handleOpen}
            >
                <FaTag  className="fs-20px mr-1"/>
                Quiero vender
            </h2>
            <Modal
                open={open}
                onClose={handleClose}
                className="border-none focus:outline-none outline-none  active:outline-none"
                aria-labelledby="request-seller-modal-title"
                aria-describedby="request-seller-modal-description"
            >
                <Box sx={{ ...style, width: 400 }}>
                    <p style={{ marginBottom: '20px', fontSize: "22px", textAlign: "center" }}>
                        ¿Quieres ser vendedor?
                    </p>
                    <div className="flex flex-row gap-5">
                        <Button
                            variant="contained"
                            fullWidth
                            startIcon={<AiOutlineCheck />}
                            onClick={handleConfirmOpen}
                            sx={{
                                backgroundColor: "#39A900"
                            }}
                        >
                            Si
                        </Button>
                        <Button
                            variant="outlined"
                            fullWidth
                            onClick={handleClose}
                            startIcon={<AiOutlineClose />}
                            sx={{
                                color: "#39A900",
                                borderColor: "#39A900"
                            }}
                        >
                            Cancelar
                        </Button>
                    </div>
                </Box>
            </Modal>
        </div>
    );
}