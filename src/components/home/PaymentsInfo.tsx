import React from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Grid, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const PaymentsInfo: React.FC = () => {
  return (
    <section className="bg-gray-100 py-6" style={{ fontFamily: 'Nunito, sans-serif' }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" className="font-extrabold">
                  <span className="text-[#39A900]">Pago Seguro</span> con PayPal
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <div className="flex flex-col lg:flex-row items-start">
                  <div className="flex-1 pr-0 lg:pr-6">
                    <ul className="list-disc list-inside space-y-1 text-gray-700 text-justify">
                      <li><strong>Seguridad:</strong> tecnología avanzada y protección antifraude.</li>
                      <li><strong>Comodidad:</strong> paga sin reingresar datos bancarios.</li>
                      <li><strong>Accesibilidad:</strong> disponible en +200 países y múltiples monedas.</li>
                      <li><strong>Rápido y sencillo:</strong> pagos en minutos, sin fricciones.</li>
                      <li><strong>Protección al comprador:</strong> respaldo ante inconvenientes.</li>
                    </ul>
                  </div>
                  <div className="mt-4 lg:mt-0 lg:w-40 flex justify-center lg:justify-end">
                    <img src="/Paypal_logo.png" alt="PayPal" className="h-24 w-auto" />
                  </div>
                </div>
              </AccordionDetails>
            </Accordion>
          </Grid>

          <Grid item xs={12} md={6}>
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" className="font-extrabold">
                  <span className="text-[#39A900]">Pago seguro</span> con Mercado Pago
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <div className="flex flex-col lg:flex-row items-start">
                  <div className="flex-1 pr-0 lg:pr-6">
                    <ul className="list-disc list-inside space-y-1 text-gray-700 text-justify">
                      <li><strong>Variedad de medios:</strong> tarjetas, PSE y efectivo.</li>
                      <li><strong>Aprobación rápida:</strong> procesamiento inmediato.</li>
                      <li><strong>Seguridad:</strong> estándares de clase mundial.</li>
                      <li><strong>Experiencia simple:</strong> pocas pantallas y mobile-friendly.</li>
                      <li><strong>Soporte local:</strong> pensado para Latinoamérica.</li>
                    </ul>
                  </div>
                  <div className="mt-4 lg:mt-0 lg:w-40 flex justify-center lg:justify-end">
                    <img src="/Paypal_logo.png" alt="Pago" className="h-24 w-auto" />
                  </div>
                </div>
              </AccordionDetails>
            </Accordion>
          </Grid>
        </Grid>
      </div>
    </section>
  );
};

export default PaymentsInfo;


