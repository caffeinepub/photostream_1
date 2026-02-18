import { useState } from 'react';
import { useSearchUsers } from '../hooks/useQueries';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import SearchResultRow from '../components/search/SearchResultRow';
import { Skeleton } from '@/components/ui/skeleton';

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: results, isLoading } = useSearchUsers(searchTerm);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">Search Users</h1>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by display name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg border p-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>
      ) : results && results.length > 0 ? (
        <div className="space-y-2">
          {results.map(([principal, profile]) => (
            <SearchResultRow
              key={principal.toString()}
              principal={principal.toString()}
              profile={profile}
            />
          ))}
        </div>
      ) : searchTerm.trim() ? (
        <div className="flex flex-col items-center justify-center gap-4 py-12">
          <img
            src="/assets/generated/empty-feed.dim_1200x800.png"
            alt="No results"
            className="max-w-md w-full opacity-50"
          />
          <p className="text-muted-foreground">No users found</p>
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-12">
          Start typing to search for users
        </p>
      )}
    </div>
  );
}
