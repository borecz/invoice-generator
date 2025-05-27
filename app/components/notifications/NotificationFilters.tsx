'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface FilterOption {
  value: string;
  label: string;
}

interface NotificationFiltersProps {
  categories: FilterOption[];
  statuses: FilterOption[];
  selectedCategory: string;
  selectedStatus: string;
  onCategoryChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

export function NotificationFilters({
  categories,
  statuses,
  selectedCategory,
  selectedStatus,
  onCategoryChange,
  onStatusChange,
}: NotificationFiltersProps) {
  const t = useTranslations('notifications');

  const clearFilters = () => {
    onCategoryChange('');
    onStatusChange('');
  };

  const hasActiveFilters = selectedCategory || selectedStatus;

  return (
    <Card className="border-dashed">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-900 dark:text-white">
            Filter Notifications
          </h3>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="h-4 w-4 mr-1" />
              Clear filters
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Category Filter */}
          <div className="space-y-2">
            <Label htmlFor="category-filter">Category</Label>
            <Select value={selectedCategory} onValueChange={onCategoryChange}>
              <SelectTrigger id="category-filter">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <Label htmlFor="status-filter">Status</Label>
            <Select value={selectedStatus} onValueChange={onStatusChange}>
              <SelectTrigger id="status-filter">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span>Active filters:</span>
              {selectedCategory && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 rounded-md">
                  Category: {categories.find(c => c.value === selectedCategory)?.label}
                  <button
                    onClick={() => onCategoryChange('')}
                    className="ml-1 hover:text-orange-600 dark:hover:text-orange-300"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {selectedStatus && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-md">
                  Status: {statuses.find(s => s.value === selectedStatus)?.label}
                  <button
                    onClick={() => onStatusChange('')}
                    className="ml-1 hover:text-blue-600 dark:hover:text-blue-300"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
