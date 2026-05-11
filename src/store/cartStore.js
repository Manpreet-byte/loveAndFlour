import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const buildCartItem = (course) => ({
  id: course.id,
  slug: course.slug,
  title: course.title,
  featuredImage: course.featuredImage ?? '',
  excerptHtml: course.excerptHtml ?? '',
  link: course.link ?? '',
  addedAt: Date.now(),
});

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      addCourse: (course) => {
        if (!course?.id) {
          return;
        }

        const existing = get().items.some((item) => item.id === course.id);
        if (existing) {
          return;
        }

        set((state) => ({
          items: [...state.items, buildCartItem(course)],
        }));
      },
      removeCourse: (courseId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== courseId),
        }));
      },
      clearCart: () => set({ items: [] }),
      hasCourse: (courseId) => get().items.some((item) => item.id === courseId),
      cartCount: () => get().items.length,
    }),
    {
      name: 'love-and-flour-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
