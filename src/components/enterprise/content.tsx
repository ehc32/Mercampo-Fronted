import { useState, useRef, useEffect } from 'react';
import OfferEnterprise from './offer';
import './style.css';
import { create_post, get_enterprise_posts } from '../../api/users';
import Pagination from '@mui/material/Pagination';
import Button from '@mui/material/Button';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface ContentEnterpriseProps {
  enterpriseId: number;
}

const optimizeImage = async (file: File, maxWidth = 800, quality = 0.7): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scaleFactor = Math.min(maxWidth / img.width, 1);
        canvas.width = img.width * scaleFactor;
        canvas.height = img.height * scaleFactor;
        
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          const optimizedReader = new FileReader();
          optimizedReader.onload = () => {
            const result = optimizedReader.result as string;
            // Extraer solo la parte base64 (después de la coma)
            const base64Data = result.split(',')[1];
            resolve(base64Data);
          };
          optimizedReader.readAsDataURL(blob as Blob);
        }, 'image/jpeg', quality);
      };
    };
    reader.readAsDataURL(file);
  });
};

const ContentEnterprise = ({ enterpriseId }: ContentEnterpriseProps) => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    images: [] as string[], // Aquí almacenamos solo las partes base64 (sin el prefijo data:image/jpeg;base64,)
    redirect_link: '',
    enterprise: enterpriseId
  });
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const decodeJWT = (token: string) => {
          try {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(
              atob(base64)
              .split('')
              .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          );
          return JSON.parse(jsonPayload);
          } catch (error) {
          console.error('Error decoding JWT:', error);
          return null;
          }
      };
      
      // Dentro del componente OfferEnterprise, agrega esto al inicio:
      const [currentUserId, setCurrentUserId] = useState<number | null>(null);
      
      useEffect(() => {
          // Obtener el objeto auth del localStorage
          const authData = localStorage.getItem('auth');
          if (authData) {
          try {
              const auth = JSON.parse(authData);
              if (auth?.state?.access) {
              const decoded = decodeJWT(auth.state.access);
              if (decoded?.user_id) {
                  setCurrentUserId(decoded.user_id);
              }
              }
          } catch (error) {
              console.error('Error parsing auth data:', error);
          }
          }
      }, []);

  useEffect(() => {
  const loadPosts = async () => {
    try {
      setLoadingPosts(true);
      const response = await get_enterprise_posts(enterpriseId, currentPage);
      
      // Asegúrate de que la respuesta tenga la estructura correcta
      const postsData = response.data || []; // Usamos data en lugar de results
      const totalItems = response.meta?.count || 0;
      const itemsPerPage = 20; // Ajusta según tu backend
      const calculatedTotalPages = Math.ceil(totalItems / itemsPerPage);

      setPosts(postsData);
      setTotalPages(calculatedTotalPages); // Usamos el cálculo basado en count
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoadingPosts(false);
    }
  };

  loadPosts();
}, [enterpriseId, currentPage]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        setIsSubmitting(true);
        try {
            const files = Array.from(e.target.files);
            
            // Verificar límite de imágenes
            if (files.length + formData.images.length > 5) {
                toast.warning(`Solo puedes subir hasta 5 imágenes (${formData.images.length}/5 actuales)`);
                return;
            }
            
            const filesToProcess = files.slice(0, 5 - formData.images.length);
            
            const optimizedImages: string[] = [];
            const newPreviews: string[] = [];
            
            // Mostrar notificación de procesamiento
            const toastId = toast.loading('Procesando imágenes...');
            
            const optimizationPromises = filesToProcess.map(file => optimizeImage(file));
            const optimizedResults = await Promise.all(optimizationPromises);
            
            optimizedImages.push(...optimizedResults);
            newPreviews.push(...filesToProcess.map(file => URL.createObjectURL(file)));
            
            setFormData(prev => ({ 
                ...prev, 
                images: [...prev.images, ...optimizedImages] 
            }));
            setPreviewImages(prev => [...prev, ...newPreviews]);
            
            toast.update(toastId, {
                render: 'Imágenes procesadas correctamente',
                type: 'success',
                isLoading: false,
                autoClose: 3000
            });
        } catch (error) {
            console.error('Error optimizing images:', error);
            toast.error('Error al procesar las imágenes');
        } finally {
            setIsSubmitting(false);
        }
    }
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
  
    // Verificar que al menos haya una imagen o un enlace
    if (formData.images.length === 0 && !formData.redirect_link) {
        toast.error('Debes proporcionar al menos una imagen o un enlace de redirección');
        return;
    }
  
    setIsSubmitting(true);
    try {
        const dataToSend = {
            title: formData.title,
            description: formData.description,
            redirect_link: formData.redirect_link,
            enterprise: enterpriseId,
            images: formData.images.map(img => `data:image/jpeg;base64,${img}`),
        };
        
        await toast.promise(
            create_post(dataToSend),
            {
                pending: 'Creando publicación...',
                success: 'Publicación creada con éxito 👌',
                error: 'Error al crear la publicación 🤯'
            }
        );
        
        // Limpiar el formulario después del envío exitoso
        setFormData({
            title: '',
            description: '',
            images: [],
            redirect_link: '',
            enterprise: enterpriseId
        });
        setPreviewImages([]);
        setShowModal(false);
        
        // Recargar los posts
        const response = await get_enterprise_posts(enterpriseId, currentPage);
        setPosts(response.data.results || response.data || []);
        setTotalPages(response.data.total_pages || 1);
    } catch (error) {
        console.error('Error creating post:', error);
        toast.error('Error al crear la publicación. Por favor, inténtalo de nuevo.');
    } finally {
        setIsSubmitting(false);
    }
};

  const removeImage = (index: number) => {
    const newImages = [...formData.images];
    const newPreviews = [...previewImages];
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    setFormData(prev => ({ ...prev, images: newImages }));
    setPreviewImages(newPreviews);
  };

  const handlePostDelete = async (postId: number) => {
    try {
        // Mostrar notificación de éxito al eliminar
        toast.success('Publicación eliminada correctamente');
        
        // Recargar los posts después de eliminar
        const response = await get_enterprise_posts(enterpriseId, currentPage);
        setPosts(response.data.results || response.data || []);
        setTotalPages(response.data.total_pages || 1);
    } catch (error) {
        console.error('Error reloading posts after deletion:', error);
        toast.error('Error al recargar las publicaciones después de eliminar');
    }
};

  // En el componente padre
  const handleUpdatePost = (updatedPost: any) => {
    console.log(updatedPost)
    setPosts(posts.map(p => p.id === updatedPost.id ? updatedPost : p));
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-end mb-4">
        {        // Solo mostrar el botón si el usuario es el propietario de la empresa
        currentUserId === enterpriseId && (
          <Button
          variant="contained"
          startIcon={<AddCircleIcon />}
          onClick={() => setShowModal(true)}
          sx={{
            backgroundColor: '#39A900',
            '&:hover': {
              backgroundColor: '#2d8600',
            },
          }}
        >
          Agregar Publicación
        </Button>
        )}
      </div>

      {/* Mostrar posts */}
      {loadingPosts ? (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span aria-hidden="true">.</span>
          </div>
          <p>Cargando publicaciones...</p>
        </div>
      ) : posts.length > 0 ? (
        <>
          <div className="posts-container" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            padding: '0 15px',
            maxWidth: '800px',
            margin: '0 auto 30px' // Margen inferior adicional
          }}>
            {posts.map((post) => (
              <div key={post.id} style={{ 
                marginBottom: '20px', 
                width: '100%'
              }}>
                <OfferEnterprise 
                  post={post} 
                  onDelete={handlePostDelete}
                  onUpdate={handleUpdatePost}
                />
              </div>
            ))}
          </div>
          
          {/* Paginación MUI */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6 mb-4">
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                sx={{
                  '& .MuiPaginationItem-root': {
                    color: '#39A900',
                  },
                  '& .MuiPaginationItem-root.Mui-selected': {
                    backgroundColor: '#39A900',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: '#2d8600',
                    },
                  },
                }}
              />
            </div>
          )}
        </>
      ) : (
        <div className="text-center my-5">
          <h5>No hay publicaciones aún</h5>
          <p>Crea la primera publicación para esta empresa</p>
        </div>
      )}

      {/* Modal para crear publicación */}
      {showModal && (
          <div 
            className="modal fade show d-block" 
            style={{ 
              backgroundColor: 'rgba(0,0,0,0.5)', 
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1050,
              overflow: 'auto'
            }}
            ref={modalRef}
          >
            <div className="modal-dialog modal-lg modal-dialog-centered" style={{ maxWidth: '800px' }}>
              <div className="modal-content" style={{ maxHeight: '90vh' }}>
                <div className="modal-header">
                  <h5 className="modal-title">Nueva Publicación</h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setShowModal(false)}
                    disabled={isSubmitting}
                  ></button>
                </div>
                
                <div className="modal-body">
                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div className="mb-3">
                    <label htmlFor="title" className="form-label">Título*</label>
                    <input
                      type="text"
                      className="form-control"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="description" className="form-label">Descripción*</label>
                    <textarea
                      className="form-control"
                      id="description"
                      name="description"
                      rows={4}
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                    ></textarea>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="redirect_link" className="form-label">Enlace (opcional)</label>
                    <input
                      type="url"
                      className="form-control"
                      id="redirect_link"
                      name="redirect_link"
                      value={formData.redirect_link}
                      onChange={handleInputChange}
                      placeholder="https://ejemplo.com"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="images" className="form-label">
                      Imágenes ({formData.images.length}/5 máximo)
                    </label>
                    <input
                      type="file"
                      className="form-control"
                      id="images"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={isSubmitting || formData.images.length >= 5}
                      ref={fileInputRef}
                    />
                    <div className="small text-muted">
                      Formatos: JPG, PNG. Máximo 5 imágenes. Se optimizarán automáticamente.
                    </div>
                  </div>

                  {/* Vista previa de imágenes */}
                  {previewImages.length > 0 && (
                    <div className="mb-4">
                      <h6 className="mb-3">Vista previa:</h6>
                      <div className="image-preview-container">
                        <div className="d-flex flex-wrap justify-content-center">
                          {previewImages.map((preview, index) => (
                            <div 
                              key={index} 
                              className="position-relative"
                              style={{ margin: '8px' }}
                            >
                              <img 
                                src={preview} 
                                alt={`Preview ${index}`} 
                                className="image-thumbnail"
                              />
                              <button
                                type="button"
                                className="remove-image-btn btn btn-danger"
                                onClick={() => removeImage(index)}
                                disabled={isSubmitting}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="modal-footer mt-auto">
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => setShowModal(false)}
                      disabled={isSubmitting}
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={isSubmitting || !formData.title || !formData.description}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Publicando...
                        </>
                      ) : 'Publicar'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentEnterprise;