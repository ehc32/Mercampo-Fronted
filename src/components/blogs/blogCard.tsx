import { useState, useEffect } from 'react';
import { formatDistanceToNow, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Rating, Tooltip, Typography } from '@mui/material';
import { Star as StarIcon } from '@mui/icons-material';
import { ChevronDown, ChevronUp, User } from 'lucide-react';
import { create_comment, get_solo_user, edit_comment, delete_comment } from '../../api/users';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getEnterpriseByUser } from '../../api/users';
import { useNavigate } from 'react-router-dom';
import './style.css';

interface EnterpriseData {
    id: number;
    name: string;
    avatar?: string;
    description?: string;
    owner_user: number;
}

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

const BlogCard = ({ post }: { post: any }) => {
    const [enterpriseData, setEnterpriseData] = useState<EnterpriseData | null>(null);
    const [loadingEnterprise, setLoadingEnterprise] = useState(true);
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
    const [images, setImages] = useState<string[]>([]);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const navigate = useNavigate();
    const descriptionLimit = 300;

    useEffect(() => {
        if (post?.description) {
            setDescriptionExceedsLimit(post.description.length > descriptionLimit);
        }
    }, [post?.description]);

    useEffect(() => {
        const fetchEnterpriseData = async () => {
            try {
                const response = await getEnterpriseByUser(post.owner);
                setEnterpriseData(response.data.enterprise);
            } catch (error) {
                console.error("Error fetching enterprise data:", error);
            } finally {
                setLoadingEnterprise(false);
            }
        };

        fetchEnterpriseData();

        const validImages = processPostImages(post.images);
        setImages(validImages);

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
    }, [post.owner, post.images, post.comments]);

    useEffect(() => {
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

    const handleEnterpriseClick = () => {
        if (enterpriseData?.owner_user) {
            navigate(`/myEnterprise/${enterpriseData.owner_user}`);
        }
    };

    function tiempoTranscurrido(fecha: string) {
        const fechaParsed = parseISO(fecha);
        return formatDistanceToNow(fechaParsed, {
            addSuffix: true,
            locale: es,
        });
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

    const isValidBase64Image = (str: string): boolean => {
        return (
            typeof str === 'string' && 
            str.startsWith('data:image') && 
            !str.includes('blob:') && 
            str.length > 100
        );
    };

    const processPostImages = (imageData: any): string[] => {
        if (!imageData) return [];

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

    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    };

    return (
        <div className="offer-post">
            {/* Enterprise Header */}
            <div className="offer-header">
                <div 
                    className="user-info"
                    onClick={handleEnterpriseClick}
                    style={{ cursor: 'pointer' }}
                >
                    <Tooltip 
                        title={enterpriseData?.name || "Empresa desconocida"}
                        arrow
                        placement="bottom"
                        componentsProps={{
                            tooltip: {
                                sx: {
                                    bgcolor: '#3A3A3A',
                                    color: 'white',
                                    fontSize: '0.8rem',
                                    '& .MuiTooltip-arrow': {
                                        color: '#3A3A3A',
                                    },
                                }
                            }
                        }}
                    >
                        {enterpriseData?.avatar ? (
                            <img 
                                src={enterpriseData.avatar} 
                                alt="Logo de la empresa" 
                                className="user-avatar"
                            />
                        ) : (
                            <div className="default-avatar">
                                <User size={20} />
                            </div>
                        )}
                    </Tooltip>
                    <div className="user-details">
                        <p className="user-name">
                            {loadingEnterprise ? "Cargando..." : enterpriseData?.name || "Empresa desconocida"}
                        </p>
                        <span className="user-role">Empresa</span>
                    </div>
                </div>
                <div className="post-date-actions">
                    <span className="post-date">
                        {formatDate(post.created_at) || "Fecha no disponible"}
                    </span>
                </div>
            </div>

            {/* Image Container */}
            {images.length > 0 ? (
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
                <div className="post-details">
                    <h3 className="post-title">{post.title || "Título no disponible"}</h3>
                    <div className="post-description-container">
                        <div className="description-content" style={{ 
                            maxHeight: showFullDescription ? 'none' : '150px',
                            overflow: 'hidden'
                        }}>
                            <p className="post-description">
                                {post.description}
                            </p>
                        </div>
                        {post.description?.length > 300 && (
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
                        <span className='span-coment'>Comentarios ({comments.length})</span>
                    </div>
                    {showComments ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>

                {showComments && (
                    <div className="comments-content">
                        <div className="comments-list-container">
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
                                                        <div className="edit-comment-form">
                                                            <textarea
                                                                value={editedCommentText}
                                                                onChange={(e) => setEditedCommentText(e.target.value)}
                                                                rows={2}
                                                            />
                                                            <div className="edit-rating-container ratingContainer">
                                                                <Typography component="legend" className="rating-label">
                                                                    Calificación
                                                                </Typography>
                                                                <Rating
                                                                    value={editedCommentRating}
                                                                    onChange={(e, val) => setEditedCommentRating(val)}
                                                                    precision={0.5}
                                                                    size="small"
                                                                />
                                                            </div>
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
                                                        <div className="comment-content">
                                                            <p className="comment-text">{comment.comment}</p>
                                                            <div className="comment-rating-container ratingContainer">
                                                                <Rating
                                                                    value={typeof comment.rating === 'string' ? parseFloat(comment.rating) : comment.rating || 0}
                                                                    readOnly
                                                                    precision={0.5}
                                                                    size="small"
                                                                />
                                                            </div>
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
                        </div>

                        <div className="add-comment">
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
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default BlogCard;