import { useState, useEffect } from 'react';
import { getContent, createContent, deleteContent, getCategories } from '../lib/api';
import type { Content, CreateContentData, CategoryType, ContentType } from '../lib/types';

export const useContent = (filters?: { type?: ContentType; category?: CategoryType }) => {
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 100,
    offset: 0,
    hasMore: false,
  });

  const fetchContent = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getContent(filters);
      setContent(response.content);
      setPagination(response.pagination);
      setLoading(false);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch content';
      setError(errorMessage);
      setLoading(false);
    }
  };

  const addContent = async (data: CreateContentData) => {
    try {
      const response = await createContent(data);
      // Refresh content list
      await fetchContent();
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to add content';
      throw new Error(errorMessage);
    }
  };

  const removeContent = async (contentId: string) => {
    try {
      await deleteContent(contentId);
      // Remove from local state
      setContent(content.filter(item => item._id !== contentId));
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete content';
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    fetchContent();
  }, [filters?.type, filters?.category]);

  return {
    content,
    loading,
    error,
    pagination,
    fetchContent,
    addContent,
    removeContent,
  };
};

export const useCategories = () => {
  const [categories, setCategories] = useState<{ category: CategoryType; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getCategories();
      setCategories(response.categories);
      setLoading(false);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch categories';
      setError(errorMessage);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    fetchCategories,
  };
};
