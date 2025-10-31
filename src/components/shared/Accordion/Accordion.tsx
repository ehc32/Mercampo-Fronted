import * as React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import './Accordion.css';

interface AccordionProps {
    titulo: string;
    contenido: string;
    isOpen: any;
    onClick: any;
}

const AccordionSet: React.FC<AccordionProps> = ({ titulo, contenido, isOpen, onClick }) => {
    return (
        <Accordion className={'light-mode-accordion boderacor'}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
                className={'light-mode-accordion titleacor'}
                onClick={() => onClick()}
            >
                {titulo}
            </AccordionSummary>
            {isOpen && (
                <AccordionDetails className={'light-mode-accordion text-justify'}>
                    {contenido}
                </AccordionDetails>
            )}
        </Accordion>
    );
};
export default AccordionSet;
