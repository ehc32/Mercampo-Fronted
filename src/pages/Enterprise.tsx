import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AsideEnterprise from "../components/enterprise/asideEnterprise";
import ContentEnterprise from "../components/enterprise/content";
import { getEnterpriseByUser } from '../api/users';
import { toast } from 'react-toastify';

const Enterprise = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [enterpriseData, setEnterpriseData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mover la función fetchEnterpriseData fuera del useEffect y usar useCallback
  const fetchEnterpriseData = useCallback(async () => {
    if (!id) {
      setError('No se proporcionó ID de usuario');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await getEnterpriseByUser(id);
      
      if (!response.data || !response.data.enterprise) {
        setError('No hay datos de empresa');
      } else {
        setEnterpriseData(response.data);
      }
      
      setIsLoading(false);
    } catch (err) {
      setError('Error al cargar los datos de la empresa');
      setIsLoading(false);
      console.error(err);
    }
  }, [id]);

  useEffect(() => {
    fetchEnterpriseData();
  }, [fetchEnterpriseData]);

  const handleRegisterEnterprise = () => {
    navigate('/create-enterprise');
    toast.info('Redirigiendo al registro de empresa');
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  if (error || !enterpriseData?.enterprise) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        backgroundColor: '#f5f5f5',
        padding: '20px',
        textAlign: 'center'
      }}>
        <h3 style={{ marginBottom: '20px', color: '#333' }}>
          {error === 'No hay datos de empresa' ? error : 'No se encontró empresa registrada'}
        </h3>
        
        <p style={{ 
          marginBottom: '30px', 
          color: '#666',
          maxWidth: '500px'
        }}>
          Parece que aún no has registrado una empresa. ¿Te gustaría crear una ahora?
        </p>
        
        <button
          onClick={handleRegisterEnterprise}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
            transition: 'background-color 0.3s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#45a049'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4CAF50'}
        >
          Registrar Mi Empresa
        </button>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'row', 
      height: '100vh', 
      overflow: 'hidden',
      width: '100vw',
      margin: 0,
      padding: 0
    }}>
      {/* Aside - Ocupa solo el espacio necesario */}
      <div style={{ 
        width: 'auto',
        minWidth: '400px',
        height: '100%',
        overflowY: 'auto'
      }}>
        <AsideEnterprise 
          enterpriseData={enterpriseData} 
          onUpdate={fetchEnterpriseData} // Pasamos directamente la función
        />
      </div>
      
      {/* Contenido principal - Ocupa todo el espacio restante */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto',
        minWidth: 0
      }}>
        <ContentEnterprise enterpriseId={enterpriseData.enterprise.owner_user} />
      </div>
    </div>
  );
};

export default Enterprise;