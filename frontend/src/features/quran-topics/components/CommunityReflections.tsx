import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Heart, Award, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Reflection } from '../types';
import { useCreateReflection, useLikeReflection, useDeleteReflection } from '../useQuranTopics';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';
import axios from 'axios';

interface CommunityReflectionsProps {
    reflections: Reflection[];
    topicSlug?: string;
}

export function CommunityReflections({ reflections, topicSlug }: CommunityReflectionsProps) {
    const [newReflection, setNewReflection] = useState('');
    const { user, isAuthenticated } = useAuthStore();
    const createMutation = useCreateReflection(topicSlug);
    const likeMutation = useLikeReflection(topicSlug);
    const deleteMutation = useDeleteReflection(topicSlug);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newReflection.trim()) return;

        if (!isAuthenticated) {
            toast.error('Please log in to share a reflection');
            return;
        }

        try {
            await createMutation.mutateAsync(newReflection);
            setNewReflection('');
            toast.success('Reflection added successfully');
        } catch (error) {
            const message = axios.isAxiosError(error)
                ? (error.response?.data as { message?: string } | undefined)?.message
                : undefined;
            toast.error(message || 'Failed to add reflection');
        }
    };

    const handleLike = async (reflectionId: string) => {
        if (!isAuthenticated) {
            toast.error('Please log in to like reflections');
            return;
        }
        try {
            await likeMutation.mutateAsync(reflectionId);
        } catch (error) {
            const message = axios.isAxiosError(error)
                ? (error.response?.data as { message?: string } | undefined)?.message
                : undefined;
            toast.error(message || 'Failed to like reflection');
        }
    };

    const handleDelete = async (reflectionId: string) => {
        try {
            await deleteMutation.mutateAsync(reflectionId);
            toast.success('Reflection deleted');
        } catch (error) {
            const message = axios.isAxiosError(error)
                ? (error.response?.data as { message?: string } | undefined)?.message
                : undefined;
            toast.error(message || 'Failed to delete reflection');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6 animate-fade-in"
        >
            {/* Write Reflection Input */}
            <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-4 shadow-sm flex flex-col gap-3">
                <div className="flex gap-3">
                    <Avatar fallback="Me" size="sm" />
                    <textarea
                        placeholder="Write a public reflection on this topic..."
                        value={newReflection}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewReflection(e.target.value)}
                        className="resize-none w-full min-h-[80px] border-none bg-muted/30 focus:outline-none focus-visible:ring-0 px-3 py-2 text-sm rounded-xl flex-1"
                    />
                </div>
                <div className="flex justify-between items-center pl-11">
                    <p className="text-xs text-muted-foreground">Responses are public.</p>
                    <Button
                        type="submit"
                        size="sm"
                        disabled={!newReflection.trim() || createMutation.isPending}
                        className="rounded-full h-8 px-4 text-xs"
                    >
                        {createMutation.isPending ? 'Posting...' : 'Post'}
                    </Button>
                </div>
            </form>

            {/* Reflections List */}
            <div className="space-y-4">
                {reflections.map((reflection) => (
                    <div key={reflection.id} className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">

                        {/* User info */}
                        <div className="flex justify-between items-start">
                            <div className="flex gap-3">
                                <Avatar fallback={reflection.userName} size="md" className="border border-border/50" />
                                <div>
                                    <p className="text-sm font-medium flex items-center gap-1.5">
                                        {reflection.userName}
                                        {user && reflection.userId === user._id && (
                                            <span className="bg-secondary text-secondary-foreground text-[10px] h-4 px-1 rounded-sm flex items-center">You</span>
                                        )}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(reflection.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </p>
                                </div>
                            </div>

                            {/* Scholar Badge */}
                            {reflection.isScholarVerified && (
                                <div className="bg-secondary/60 text-primary text-xs font-medium px-2 py-1 rounded-md flex flex-col sm:flex-row items-center gap-1.5 border border-primary/20 text-center">
                                    <Award className="h-3 w-3" />
                                    Scholar Reviewed
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                            {reflection.content}
                        </p>

                        {/* Scholar Note (if applicable) */}
                        {reflection.isScholarVerified && reflection.scholarNote && (
                            <div className="bg-secondary/40 border-l-2 border-primary/40 pl-3 py-2 mt-2 rounded-r-lg">
                                <p className="text-xs font-medium text-primary mb-1 flex items-center gap-1">
                                    <Award className="h-3 w-3" />
                                    Note from {reflection.scholarName}
                                </p>
                                <p className="text-xs text-muted-foreground leading-relaxed italic">
                                    "{reflection.scholarNote}"
                                </p>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-4 pt-2 border-t border-border/50">
                            <button type="button" onClick={() => handleLike(reflection.id)} className="flex items-center gap-1.5 text-muted-foreground hover:text-red-500 transition-colors group">
                                <Heart className="h-4 w-4 group-active:scale-95 transition-transform" />
                                <span className="text-xs font-medium">{reflection.likes > 0 ? reflection.likes : 'Like'}</span>
                            </button>
                            <button type="button" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors group">
                                <MessageCircle className="h-4 w-4 group-active:scale-95 transition-transform" />
                                <span className="text-xs font-medium">Reply</span>
                            </button>
                            {user && reflection.userId === user._id && (
                                <button type="button" onClick={() => handleDelete(reflection.id)} className="flex items-center gap-1.5 text-muted-foreground hover:text-destructive transition-colors group ml-auto">
                                    <Trash2 className="h-4 w-4 group-active:scale-95 transition-transform" />
                                    <span className="text-xs font-medium">Delete</span>
                                </button>
                            )}
                        </div>

                    </div>
                ))}

                {reflections.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-xl">
                        <MessageCircle className="h-8 w-8 mx-auto mb-3 opacity-20" />
                        <p>No reflections yet. Be the first to share your thoughts!</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
