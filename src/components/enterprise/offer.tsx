import { useState, useEffect } from 'react';
import './style.css';
import { formatDistanceToNow, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Rating, Typography } from '@mui/material';
import { Star as StarIcon } from '@mui/icons-material';
import { Trash2, Edit, X, Check, ChevronDown, ChevronUp, User } from 'lucide-react';
import { create_comment, get_solo_user, edit_comment, delete_comment } from '../../api/users';
import { delete_post, update_post } from '../../api/users';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface UserData {
    id: number;
    name: string;
    avatar?: string;
    role: string;
}

interface Comment {
    id: number;
    post: number;
    user: number;
    comment: string;
    rating: number | string | null;
    created_at: string;
    is_active: boolean;
    user_details?: {
        name: string;
        avatar?: string;
    };
}

const OfferEnterprise = ({ post, onDelete, onUpdate }: { 
    post: any; 
    onDelete: (postId: number) => void;
    onUpdate: (updatedPost: any) => void;
}) => {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loadingUser, setLoadingUser] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [editedPost, setEditedPost] = useState({
        title: '',
        description: '',
        redirect_link: '',
        images: [] as string[]
    });
    const [images, setImages] = useState<string[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [originalImages, setOriginalImages] = useState<string[]>([]);
    const [newImagesBase64, setNewImagesBase64] = useState<string[]>([]);
    const [keptOriginalImages, setKeptOriginalImages] = useState<boolean[]>([]);

    const [comments, setComments] = useState<Comment[]>(post.comments || []);
    const [newComment, setNewComment] = useState('');
    const [commentRating, setCommentRating] = useState<number | null>(null);
    const [showComments, setShowComments] = useState(false);
    const [loadingComments, setLoadingComments] = useState(false);

    const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
    const [editedCommentText, setEditedCommentText] = useState('');
    const [editedCommentRating, setEditedCommentRating] = useState<number | null>(null);

    const [showFullDescription, setShowFullDescription] = useState(false);
    const [descriptionExceedsLimit, setDescriptionExceedsLimit] = useState(false);
    const descriptionLimit = 300; // Número de caracteres para mostrar inicialmente

    useEffect(() => {
        if (post?.description) {
            setDescriptionExceedsLimit(post.description.length > descriptionLimit);
        }
    }, [post?.description]);

    // Agrega esta función al inicio del componente (fuera del componente principal)
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

    function tiempoTranscurrido(fecha: string) {
        const fechaParsed = parseISO(fecha);
        const resultado = formatDistanceToNow(fechaParsed, {
            addSuffix: true,
            locale: es,
        });
        return resultado;
    }

    const handleAddComment = async () => {
        if (newComment.trim() === '') {
            toast.error('Por favor escribe un comentario');
            return;
        }
    
        try {
            const commentData = {
                comment: newComment,
                rating: commentRating ?? undefined
            };
    
            const response = await create_comment(post.id, commentData);
            
            // Obtener detalles del usuario actual (el que está comentando)
            const currentUser = await get_solo_user(currentUserId!);
            
            const commentWithUser = {
                ...response,
                user_details: {
                    name: currentUser.name || 'Anónimo',
                    avatar: currentUser.avatar
                }
            };
            
            setComments([...comments, commentWithUser]);
            setNewComment('');
            setCommentRating(null);
            toast.success('Comentario agregado con éxito');
        } catch (error) {
            console.error('Error al agregar comentario:', error);
            toast.error('Ocurrió un error al agregar el comentario');
        }
    };

    const handleEditComment = (comment: Comment) => {
        setEditingCommentId(comment.id);
        setEditedCommentText(comment.comment);
        setEditedCommentRating(typeof comment.rating === 'string' ? parseFloat(comment.rating) : comment.rating);
    };
    
    const handleCancelEditComment = () => {
        setEditingCommentId(null);
        setEditedCommentText('');
        setEditedCommentRating(null);
    };
    
    const handleSaveEditedComment = async (commentId: number) => {
        try {
            const updatedComment = await edit_comment(commentId, {
                comment: editedCommentText,
                rating: editedCommentRating ?? undefined
            });
            
            setComments(comments.map(comment => 
                comment.id === commentId ? { ...comment, ...updatedComment } : comment
            ));
            
            handleCancelEditComment();
            toast.success('Comentario actualizado correctamente');
        } catch (error) {
            console.error('Error al editar comentario:', error);
            toast.error('Ocurrió un error al editar el comentario');
        }
    };
    
    const handleDeleteComment = async (commentId: number) => {
        toast.info(
            <div>
                <p>¿Estás seguro de que quieres eliminar este comentario?</p>
                <div className="toast-actions">
                    <button 
                        className="toast-confirm-btn"
                        onClick={() => {
                            toast.dismiss();
                            confirmDeleteComment(commentId);
                        }}
                    >
                        Sí, eliminar
                    </button>
                    <button 
                        className="toast-cancel-btn"
                        onClick={() => toast.dismiss()}
                    >
                        Cancelar
                    </button>
                </div>
            </div>,
            {
                autoClose: false,
                closeButton: false,
            }
        );
    };

    const confirmDeleteComment = async (commentId: number) => {
        try {
            await delete_comment(commentId);
            setComments(comments.filter(comment => comment.id !== commentId));
            toast.success('Comentario eliminado correctamente');
        } catch (error) {
            console.error('Error al eliminar comentario:', error);
            toast.error('Ocurrió un error al eliminar el comentario');
        }
    };

    const toggleComments = () => {
        setShowComments(!showComments);
    };

    // Función para validar que una cadena sea un base64 válido
    const isValidBase64Image = (str: string): boolean => {
        return (
            typeof str === 'string' && 
            str.startsWith('data:image') && 
            !str.includes('blob:') && 
            str.length > 100
        );
    };

    // Inicializar el estado de edición con los valores actuales del post
    useEffect(() => {
        if (post) {
            setEditedPost({
                title: post.title || '',
                description: post.description || '',
                redirect_link: post.redirect_link || '',
                images: post.images || []
            });
            
            const validImages = processPostImages(post.images);
            setOriginalImages(validImages);
            setKeptOriginalImages(validImages.map(() => true));
            
            // Cargar detalles de usuario para cada comentario
            if (post.comments && post.comments.length > 0) {
                const loadCommentUsers = async () => {
                    const commentsWithUsers = await Promise.all(
                        post.comments.map(async (comment: Comment) => {
                            try {
                                const user = await get_solo_user(comment.user);
                                return {
                                    ...comment,
                                    user_details: {
                                        name: user.name,
                                        avatar: user.avatar
                                    }
                                };
                            } catch (error) {
                                console.error("Error al cargar usuario del comentario:", error);
                                return {
                                    ...comment,
                                    user_details: {
                                        name: 'Usuario desconocido',
                                        avatar: ''
                                    }
                                };
                            }
                        })
                    );
                    setComments(commentsWithUsers);
                };
                
                loadCommentUsers();
            }
        }
    }, [post]);

    const handleDelete = async () => {
        toast.info(
            <div>
                <p>¿Estás seguro de que quieres eliminar este post?</p>
                <div className="toast-actions">
                    <button 
                        className="toast-confirm-btn"
                        onClick={() => {
                            toast.dismiss();
                            confirmDeletePost();
                        }}
                    >
                        Sí, eliminar
                    </button>
                    <button 
                        className="toast-cancel-btn"
                        onClick={() => toast.dismiss()}
                    >
                        Cancelar
                    </button>
                </div>
            </div>,
            {
                autoClose: false,
                closeButton: false,
            }
        );
    };

    const confirmDeletePost = async () => {
        setIsDeleting(true);
        try {
            await delete_post(post.id);
            onDelete(post.id);
            toast.success('Post eliminado correctamente');
        } catch (error) {
            console.error("Error al eliminar el post:", error);
            toast.error('Ocurrió un error al eliminar el post');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
        const validImages = processPostImages(post.images);
        setOriginalImages(validImages);
        setImagePreviews([...validImages]);
        setKeptOriginalImages(validImages.map(() => true));
        setNewImagesBase64([]);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditedPost({
            title: post.title || '',
            description: post.description || '',
            redirect_link: post.redirect_link || '',
            images: post.images || []
        });
        setNewImagesBase64([]);
        setImagePreviews([]);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditedPost(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const remainingSlots = 5 - imagePreviews.length;
            
            if (remainingSlots <= 0) return;
            
            const filesToAdd = files.slice(0, remainingSlots);
            
            const newBase64Images: string[] = [];
            
            for (const file of filesToAdd) {
                try {
                    const base64String = await optimizeImage(file);
                    if (isValidBase64Image(base64String)) {
                        newBase64Images.push(base64String);
                    }
                } catch (error) {
                    console.error("Error al convertir imagen a base64:", error);
                }
            }
            
            setNewImagesBase64(prev => [...prev, ...newBase64Images]);
            setImagePreviews(prev => [...prev, ...newBase64Images]);
        }
    };

    const removeImage = (index: number) => {
        const isOriginal = index < originalImages.length;
        
        if (isOriginal) {
            setKeptOriginalImages(prev => {
                const newKept = [...prev];
                newKept[index] = false;
                return newKept;
            });
        } else {
            const newImageIndex = index - originalImages.length;
            setNewImagesBase64(prev => prev.filter((_, i) => i !== newImageIndex));
        }
        
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const processPostImages = (imageData: any): string[] => {
        if (!imageData) {
            return [];
        }

        let imageArray: string[] = [];
        
        if (typeof imageData === 'string') {
            if (isValidBase64Image(imageData)) {
                imageArray = [imageData];
            }
        } 
        else if (Array.isArray(imageData)) {
            imageArray = imageData.filter(img => isValidBase64Image(img));
        }

        return imageArray.slice(0, 5);
    };

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
                  resolve(result);
                };
                optimizedReader.readAsDataURL(blob as Blob);
              }, 'image/jpeg', quality);
            };
          };
          reader.readAsDataURL(file);
        });
    };

    const handleSubmit = async () => {
        if (!editedPost.title.trim() || !editedPost.description.trim()) {
            toast.error('El título y la descripción son obligatorios');
            return;
        }
    
        setIsUpdating(true);
        try {
            const postData: any = {
                title: editedPost.title,
                description: editedPost.description,
                redirect_link: editedPost.redirect_link || '',
            };
    
            const keptOriginal = originalImages.filter((_, index) => keptOriginalImages[index]);
            const validNewImages = newImagesBase64.filter(img => isValidBase64Image(img));
            const finalImages = [...keptOriginal, ...validNewImages].slice(0, 5);
            
            postData.images = finalImages;
            
            const updatedPost = await update_post(post.id, postData);
            onUpdate(updatedPost);
            setIsEditing(false);
            setImages(finalImages);
            toast.success('Post actualizado correctamente');
        } catch (error) {
            console.error("Error al actualizar el post:", error);
            toast.error('Ocurrió un error al actualizar el post');
        } finally {
            setIsUpdating(false);
        }
    };
    
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const user = await get_solo_user(post.owner);
                setUserData(user);
            } catch (error) {
                console.error("Error fetching user data:", error);
            } finally {
                setLoadingUser(false);
            }
        };

        fetchUserData();

        const validImages = processPostImages(post.images);
        setImages(validImages);
    }, [post.owner, post.images]);

    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    };

    const formatDateTime = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    };

    return (
        <div className="offer-post">
            {/* User Header */}
            <div className="offer-header">
                <div className="user-info">
                    {userData?.avatar ? (
                        <img 
                            src={userData.avatar} 
                            alt="Avatar del usuario" 
                            className="user-avatar"
                        />
                    ) : (
                        <div className="default-avatar">
                            <User size={20} />
                        </div>
                    )}
                    <div className="user-details">
                        <p className="user-name">
                            {loadingUser ? "Cargando..." : userData?.name || "Usuario desconocido"}
                        </p>
                        <span className="user-role">{userData?.role || "Rol no especificado"}</span>
                    </div>
                </div>
                <div className="post-date-actions">
                    <span className="post-date">
                        {formatDate(post.created_at) || "Fecha no disponible"}
                    </span>
                    {((currentUserId && currentUserId === post.owner)) && (
                        <div className="post-actions">
                            {isEditing ? (
                                <>
                                    <button 
                                        onClick={handleCancelEdit}
                                        disabled={isUpdating}
                                        className="action-btn cancel-btn"
                                        title="Cancelar"
                                    >
                                        <X size={16} />
                                    </button>
                                    <button 
                                        onClick={handleSubmit}
                                        disabled={isUpdating}
                                        className="action-btn save-btn"
                                        title="Guardar"
                                    >
                                        {isUpdating ? '...' : <Check size={16} />}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button 
                                        onClick={handleEdit}
                                        className="action-btn edit-btn"
                                        title="Editar"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button 
                                        onClick={handleDelete}
                                        disabled={isDeleting}
                                        className="action-btn delete-btn"
                                        title="Eliminar"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Image Container */}
            {isEditing ? (
                <div className="edit-images-container">
                    <div className={`image-grid ${imagePreviews.length > 0 ? 'has-images' : ''}`}>
                        {imagePreviews.map((img, index) => (
                            <div key={index} className="image-item">
                                <img 
                                    src={img}
                                    alt={`Imagen ${index + 1}`}
                                    className="image-preview"
                                />
                                <button
                                    onClick={() => removeImage(index)}
                                    className="remove-image-btn"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                        {imagePreviews.length < 5 && (
                            <div className="add-image-container">
                                <label className="add-image-label">
                                    <input 
                                        type="file" 
                                        multiple 
                                        onChange={handleImageChange}
                                        className="image-input"
                                    />
                                    <span className="add-image-icon">+</span>
                                    <span className="add-image-text">Añadir</span>
                                    <span className="remaining-slots">({5 - imagePreviews.length})</span>
                                </label>
                            </div>
                        )}
                    </div>
                </div>
            ) : images.length > 0 ? (
                <div className={`post-images image-count-${images.length}`}>
                    {images.map((img, index) => (
                        <div key={index} className="post-image-container">
                            <img 
                                src={img}
                                alt={`Imagen ${index + 1}`}
                                className="post-image"
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="no-images">
                    <span>No hay imágenes</span>
                </div>
            )}

            {/* Post Content */}
            <div className="post-content">
                {isEditing ? (
                    <div className="edit-post-form">
                        <div className="form-group">
                            <label>Título*</label>
                            <input
                                type="text"
                                name="title"
                                value={editedPost.title}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Descripción*</label>
                            <textarea
                                name="description"
                                value={editedPost.description}
                                onChange={handleInputChange}
                                rows={3}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Enlace (opcional)</label>
                            <input
                                type="url"
                                name="redirect_link"
                                value={editedPost.redirect_link}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="post-details">
                        <h3 className="post-title">{post.title || "Título no disponible"}</h3>
                        <div className="post-description-container">
                            <p className="post-description">
                                {showFullDescription || !descriptionExceedsLimit 
                                    ? post.description 
                                    : `${post.description.substring(0, descriptionLimit)}...`
                                }
                            </p>
                            {descriptionExceedsLimit && (
                                <button 
                                    onClick={() => setShowFullDescription(!showFullDescription)}
                                    className="read-more-btn"
                                >
                                    {showFullDescription ? 'Mostrar menos' : 'Seguir leyendo'}
                                </button>
                            )}
                        </div>
                        <div className="post-footer">
                            <div className="post-rating ratingContainer">
                                <Rating
                                    value={parseFloat(post.rating) || 0}
                                    readOnly
                                    precision={0.5}
                                    icon={<StarIcon fontSize="inherit" style={{ color: '#f59e0b' }} />}
                                    emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
                                />
                            </div>
                            {post.redirect_link && (
                                <a 
                                    href={post.redirect_link} 
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="post-link"
                                >
                                    Ver más →
                                </a>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Comments Section */}
            <div className="comments-section">
                <div 
                    className="comments-toggle"
                    onClick={toggleComments}
                >
                    <h3 className=''>Comentarios ({comments.length})</h3>
                    <div className="toggle-content">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span>Comentarios ({comments.length})</span>
                    </div>
                    {showComments ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>

                {showComments && (
                    <div className="comments-content">
                        {comments.length > 0 ? (
                            <div className="comments-list">
                                {comments.map(comment => (
                                    <div key={comment.id} className="comment-item">
                                        <div className="comment-user">
                                            {comment.user_details?.avatar ? (
                                                <img 
                                                    src={comment.user_details.avatar} 
                                                    className="comment-avatar"
                                                    alt="Avatar"
                                                />
                                            ) : (
                                                <div className="comment-default-avatar">
                                                    <User size={14} />
                                                </div>
                                            )}
                                            <div className="comment-details">
                                                <div className="comment-header">
                                                    <span className="comment-author">
                                                        {comment.user_details?.name || 'Anónimo'}
                                                    </span>
                                                    <span className="comment-date">
                                                        {tiempoTranscurrido(comment.created_at)}
                                                    </span>
                                                </div>
                                                {editingCommentId === comment.id ? (
                                                    <div className="edit-comment-form ratingContainer">
                                                        <Rating
                                                            value={editedCommentRating}
                                                            onChange={(e, val) => setEditedCommentRating(val)}
                                                            precision={0.5}
                                                            size="small"
                                                        />
                                                        <textarea
                                                            value={editedCommentText}
                                                            onChange={(e) => setEditedCommentText(e.target.value)}
                                                            rows={2}
                                                        />
                                                        <div className="edit-comment-actions">
                                                            <button 
                                                                onClick={handleCancelEditComment}
                                                                className="cancel-edit-btn"
                                                            >
                                                                Cancelar
                                                            </button>
                                                            <button 
                                                                onClick={() => handleSaveEditedComment(comment.id)}
                                                                className="save-edit-btn"
                                                            >
                                                                Guardar
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="comment-content ratingContainer">
                                                        <Rating
                                                            value={typeof comment.rating === 'string' ? parseFloat(comment.rating) : comment.rating || 0}
                                                            readOnly
                                                            precision={0.5}
                                                            size="small"
                                                        />
                                                        <p className="comment-text">{comment.comment}</p>
                                                        {currentUserId === comment.user && (
                                                            <div className="comment-actions">
                                                                <button 
                                                                    onClick={() => handleEditComment(comment)}
                                                                    className="edit-comment-btn"
                                                                >
                                                                    Editar
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleDeleteComment(comment.id)}
                                                                    className="delete-comment-btn"
                                                                >
                                                                    Eliminar
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="no-comments">
                                No hay comentarios aún
                            </div>
                        )}

                        <div className="add-comment">
                            <div className="comment-rating-input ratingContainer">
                                <Typography component="legend" className="rating-label">
                                    Calificación
                                </Typography>
                                <Rating
                                    value={commentRating}
                                    onChange={(e, val) => setCommentRating(val)}
                                    precision={1}
                                />
                            </div>
                            <div className="comment-input-container">
                                <input
                                    type="text"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Escribe un comentario..."
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                                />
                                <button 
                                    onClick={handleAddComment}
                                    className="submit-comment-btn"
                                >
                                    Enviar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default OfferEnterprise;