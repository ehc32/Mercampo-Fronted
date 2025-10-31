import * as React from 'react';
import { Avatar, Box, Typography } from '@mui/material';
import Rating from '@mui/material/Rating';
import StarIcon from '@mui/icons-material/Star';

const CommentItem = ({ profileImage, name, date, commentText, ratingValue }) => {
    return (
        <Box sx={{ display: 'flex', alignItems: 'start', gap: 2, padding: 2, borderBottom: '1px solid #ccc' }}>
            {/* Foto de perfil */}
            <Avatar
                src={profileImage ? profileImage : '/img/default-avatar.png'} 
                alt={name} 
                sx={{ width: 50, height: 50 }} />

            {/* Información del comentario */}
            <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 1 }}>
                    <Typography variant="h6">{name}</Typography>
                    <Typography variant="body2" color="textSecondary">( {date} )</Typography>
                </Box>
                <Rating
                    name="read-only"
                    value={ratingValue}
                    readOnly
                    precision={0.5}
                    emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
                    sx={{ marginBottom: 1 }}
                />
                <Typography variant="body1">{commentText}</Typography>
            </Box>
        </Box>
    );
};

export default CommentItem;
