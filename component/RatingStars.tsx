'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Star } from 'lucide-react';

type RatingStarsProps = {
    consultantId: number;
    blogId: number | null;
    rating: number;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
    interactive?: boolean;
    onRatingSubmitted?: () => void; // New callback prop
};

export default function RatingStars({ 
    consultantId, 
    blogId = null, 
    rating: initialRating = 0,
    size = 'md',
    showLabel = true,
    interactive = true,
    onRatingSubmitted // New prop
}: RatingStarsProps) {
    const [currentRating, setCurrentRating] = useState(initialRating);
    const [hover, setHover] = useState(0);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasRated, setHasRated] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    const sizeConfig = {
        sm: { star: 16, text: 'text-sm' },
        md: { star: 20, text: 'text-base' },
        lg: { star: 24, text: 'text-lg' }
    };

    useEffect(() => {
        const checkExistingRating = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token || !consultantId) return;

                setIsLoading(true);
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/ratings/check`,
                    {
                        params: { consultant_id: consultantId, blog_id: blogId },
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );

                if (response.data.hasRated) {
                    setCurrentRating(response.data.rating);
                    setHasRated(true);
                    setSubmitted(true);
                }
            } catch (error) {
                console.error('Error checking existing rating:', error);
            } finally {
                setIsLoading(false);
            }
        };

        checkExistingRating();
    }, [consultantId, blogId]);

    const handleRating = async (value: number) => {
        if (!interactive || submitted) return;
        
        try {
            if (!consultantId || consultantId <= 0) {
                throw new Error('Invalid consultant selected');
            }

            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('You must be logged in to rate');
            }

            setIsLoading(true);
            const payload = {
                consultants_id: consultantId,
                blog_id: blogId,
                rating: value
            };

            await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/ratings`,
                payload,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    withCredentials: true
                }
            );

            setCurrentRating(value);
            setSubmitted(true);
            setHasRated(true);
            setError(null);
            
            // Store in localStorage
            localStorage.setItem(`rated-${consultantId}-${blogId || 'global'}`, value.toString());
            
            // Notify parent component
            if (onRatingSubmitted) {
                onRatingSubmitted();
            }

            // Dispatch global event as fallback
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new Event('rating-submitted'));
            }
        } catch (error: any) {
            console.error('Error submitting rating:', error);
            setError(
                error.response?.data?.message || 
                error.message || 
                'Failed to submit rating'
            );
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const storedRating = localStorage.getItem(`rated-${consultantId}-${blogId || 'global'}`);
        if (storedRating) {
            setCurrentRating(Number(storedRating));
            setSubmitted(true);
            setHasRated(true);
        }
    }, [consultantId, blogId]);

    if (isLoading) {
        return (
            <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                        key={star}
                        size={sizeConfig[size].star}
                        className="text-gray-300 animate-pulse"
                    />
                ))}
                {showLabel && (
                    <span className={`ml-2 text-gray-400 ${sizeConfig[size].text}`}>
                        Loading...
                    </span>
                )}
            </div>
        );
    }

    return (
        <div className="flex flex-col">
            <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        className={`transition-colors duration-150 ${
                            star <= currentRating 
                                ? 'text-yellow-400' 
                                : submitted ? 'text-gray-300' : 'text-gray-300 hover:text-yellow-300'
                        } ${!interactive || submitted ? 'cursor-default' : 'cursor-pointer'}`}
                        onMouseEnter={() => interactive && !submitted && setHover(star)}
                        onMouseLeave={() => interactive && !submitted && setHover(0)}
                        onClick={() => interactive && !submitted && handleRating(star)}
                        disabled={!interactive || submitted}
                        aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
                    >
                        <Star 
                            size={sizeConfig[size].star}
                            fill={star <= currentRating ? 'currentColor' : 'none'}
                        />
                    </button>
                ))}
                
                {showLabel && submitted && (
                    <span className={`ml-2 text-green-600 ${sizeConfig[size].text}`}>
                        Rated!
                    </span>
                )}
            </div>
            
            {error && (
                <div className={`text-red-500 mt-2 ${sizeConfig[size].text}`}>
                    {error}
                </div>
            )}
        </div>
    );
}