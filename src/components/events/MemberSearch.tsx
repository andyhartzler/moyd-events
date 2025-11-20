'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Search, User } from 'lucide-react';

interface MemberSearchProps {
  onSelectMember: (member: any) => void;
  loading: boolean;
}

export function MemberSearch({ onSelectMember, loading }: MemberSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const searchMembers = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      setSearching(true);

      try {
        const { data, error } = await supabase
          .from('members')
          .select('id, name, email')
          .or(`name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
          .limit(10);

        if (error) throw error;
        setSearchResults(data || []);
      } catch (err) {
        console.error('Search error:', err);
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    };

    const debounceTimer = setTimeout(searchMembers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  return (
    <div>
      {/* Search Input */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          disabled={loading}
          autoFocus
        />
      </div>

      {/* Search Results */}
      {searching && (
        <div className="text-center py-8 text-gray-500">
          <div className="animate-pulse">Searching...</div>
        </div>
      )}

      {!searching && searchQuery.length >= 2 && searchResults.length === 0 && (
        <div className="text-center py-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <p className="text-gray-700 font-medium mb-2">
              No members found matching "{searchQuery}"
            </p>
            <p className="text-sm text-gray-600">
              Try searching by your full name or email address
            </p>
          </div>
        </div>
      )}

      {searchResults.length > 0 && (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {searchResults.map((member) => (
            <button
              key={member.id}
              onClick={() => onSelectMember(member)}
              disabled={loading}
              className="member-result-card w-full text-left"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg font-bold text-primary">
                    {member.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-grow">
                  <div className="font-semibold text-gray-900">
                    {member.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {member.email}
                  </div>
                </div>
                <div className="text-primary">
                  <User className="w-5 h-5" />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {searchQuery.length < 2 && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">
            Start typing your name or email to search
          </p>
        </div>
      )}
    </div>
  );
}
