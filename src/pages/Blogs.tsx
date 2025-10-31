import { useState, useEffect } from 'react';
import Pagination from '@mui/material/Pagination';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { get_all_enterprise_posts } from '../api/users';
import BlogCard from '../components/blogs/blogCard';
import { 
  Container, 
  Box, 
  Typography, 
  Grid, 
  TextField, 
  InputAdornment, 
  Skeleton,
  MenuItem
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

const Blogs = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoadingPosts(true);
        
        // Mapear los valores de ordenamiento a los que espera la API
        const orderByDate = sortBy === 'oldest' ? 'asc' : 'desc';
        const orderByComments = sortBy === 'popular' ? 'desc' : undefined;
        
        const response = await get_all_enterprise_posts(
          currentPage, 
          {
            orderByDate,
            orderByComments,
            searchQuery: searchQuery || undefined
          }
        );
        
        const postsData = response.data || [];
        const totalItems = response.total_posts || 0;
        const itemsPerPage = 20;
        const calculatedTotalPages = Math.ceil(totalItems / itemsPerPage);

        setPosts(postsData);
        setTotalPages(calculatedTotalPages);
        setTotalPosts(totalItems);
      } catch (error) {
        console.error('Error loading posts:', error);
        toast.error('Error al cargar las publicaciones');
      } finally {
        setLoadingPosts(false);
      }
    };

    // Agregar un pequeño delay para evitar múltiples llamadas al API mientras se escribe
    const timer = setTimeout(() => {
      loadPosts();
    }, 500);

    return () => clearTimeout(timer);
  }, [currentPage, searchQuery, sortBy]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Hero Section */}
      <Box sx={{ 
        textAlign: 'center', 
        mb: 6,
        backgroundColor: 'grey.800',
        color: 'white',
        py: 8,
        px: 2,
        borderRadius: 2,
        boxShadow: 3
      }}>
        <Typography variant="h2" component="h1" sx={{ 
          fontWeight: 700, 
          mb: 2,
          fontSize: { xs: '2rem', md: '3rem' },
          color: 'white'
        }}>
          Nuestro Blog
        </Typography>
        <Typography variant="h5" sx={{ 
          maxWidth: '700px', 
          mx: 'auto',
          fontSize: { xs: '1rem', md: '1.25rem' },
          color: 'white'
        }}>
          Descubre artículos, noticias y consejos para hacer crecer tu negocio
        </Typography>
      </Box>

      {/* Search and Sort Bar */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' }, 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4,
        gap: 2
      }}>
        <TextField
          placeholder="Buscar artículos..."
          variant="outlined"
          size="small"
          sx={{ 
            width: { xs: '100%', md: '400px' },
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              backgroundColor: 'background.paper'
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        
        <Box sx={{ display: 'flex', gap: 2, width: { xs: '100%', md: 'auto' } }}>
          <TextField
            select
            label="Ordenar por"
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setCurrentPage(1); // Resetear a la primera página al cambiar el orden
            }}
            size="small"
            sx={{ minWidth: 180, borderRadius: 2 }}
          >
            <MenuItem value="recent">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <NewReleasesIcon fontSize="small" /> Más recientes
              </Box>
            </MenuItem>
            <MenuItem value="popular">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUpIcon fontSize="small" /> Más comentados
              </Box>
            </MenuItem>
            <MenuItem value="oldest">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarTodayIcon fontSize="small" /> Más antiguos
              </Box>
            </MenuItem>
          </TextField>
        </Box>
      </Box>

      {/* Posts Grid */}
      <Typography variant="h5" sx={{ 
        fontWeight: 600, 
        mb: 3,
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <FilterListIcon /> 
        {sortBy === 'recent' && 'Artículos recientes'}
        {sortBy === 'popular' && 'Artículos más comentados'}
        {sortBy === 'oldest' && 'Artículos más antiguos'}
        {searchQuery && ` (${totalPosts} resultados)`}
      </Typography>

      {loadingPosts ? (
        <Grid container spacing={4}>
          {[...Array(6)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2, mb: 1 }} />
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="text" width="40%" />
            </Grid>
          ))}
        </Grid>
      ) : posts.length > 0 ? (
        <>
          <Grid container spacing={4}>
            {posts.map((post) => (
              <Grid item xs={12} sm={6} md={4} key={post.id} sx={{ display: 'flex' }}>
                <Box sx={{ 
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%'
                }}>
                  <BlogCard post={post} />
                </Box>
              </Grid>
            ))}
          </Grid>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6, mb: 4 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                sx={{
                  '& .MuiPaginationItem-root': {
                    color: 'text.primary',
                    '&:hover': {
                      backgroundColor: 'primary.light',
                    },
                  },
                  '& .MuiPaginationItem-root.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                  },
                }}
              />
            </Box>
          )}
        </>
      ) : (
        <Box sx={{ 
          textAlign: 'center', 
          my: 10,
          p: 4,
          backgroundColor: 'background.paper',
          borderRadius: 2,
          boxShadow: 1
        }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
            No hay publicaciones disponibles
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {searchQuery ? 
              'No encontramos resultados para tu búsqueda. Intenta con otros términos.' : 
              'Vuelve más tarde para ver nuevas publicaciones.'}
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default Blogs;