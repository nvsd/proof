import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@radix-ui/react-dropdown-menu';
import { cn } from '@/lib/classes';

export function Header({
  user,
}: {
  user: { id: number; email: string; name: string; picture: string; googleId: string } | null;
}) {
  if (!user) return null;

  return (
    <DropdownMenu modal>
      <DropdownMenuTrigger
        className={cn(
          'w-8 h-8 absolute top-2 right-2 cursor-pointer',
          'shadow-sm border border-gray-200 rounded-full overflow-hidden',
          'focus:outline-none focus:ring-0 focus:ring-offset-0',
        )}
      >
        <img
          src={user.picture}
          alt={user.name}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem className="text-red-500">Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
