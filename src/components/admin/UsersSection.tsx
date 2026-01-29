import { useState } from "react";
import {
  Users,
  Search,
  Store,
  Crown,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  is_seller: boolean | null;
  seller_request_pending: boolean | null;
  bio: string | null;
  created_at: string;
}

interface UserRole {
  user_id: string;
  role: "admin" | "moderator" | "user";
}

interface UsersSectionProps {
  profiles: Profile[];
  userRoles: UserRole[];
  isLoading: boolean;
  onDataChange: () => void;
}

const UsersSection = ({ profiles, userRoles, isLoading, onDataChange }: UsersSectionProps) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  const getUserRole = (userId: string): string => {
    const role = userRoles.find((r) => r.user_id === userId);
    return role?.role || "user";
  };

  const handleApproveSeller = async (profileId: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_seller: true, seller_request_pending: false })
        .eq("id", profileId);

      if (error) throw error;

      toast({
        title: "Seller approved",
        description: "User has been granted seller privileges.",
      });
      onDataChange();
    } catch (error: any) {
      toast({
        title: "Error approving seller",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleRevokeSeller = async (profileId: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_seller: false, seller_request_pending: false })
        .eq("id", profileId);

      if (error) throw error;

      toast({
        title: "Seller status revoked",
        description: "User's seller privileges have been removed.",
      });
      onDataChange();
    } catch (error: any) {
      toast({
        title: "Error revoking seller",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredProfiles = profiles.filter(
    (profile) =>
      profile.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.user_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">User Management</h2>
        <p className="text-muted-foreground">View and manage all registered users</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                All Users
              </CardTitle>
              <CardDescription>{profiles.length} total users</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProfiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={profile.avatar_url || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {profile.display_name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{profile.display_name || "No Name"}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {profile.user_id}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getUserRole(profile.user_id) === "admin" ? "default" : "secondary"}
                        className="capitalize"
                      >
                        {getUserRole(profile.user_id) === "admin" && <Crown className="h-3 w-3 mr-1" />}
                        {getUserRole(profile.user_id)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {profile.is_seller ? (
                        <Badge className="bg-success/10 text-success border-success/20">
                          <Store className="h-3 w-3 mr-1" />
                          Seller
                        </Badge>
                      ) : profile.seller_request_pending ? (
                        <Badge variant="outline" className="border-amber-500 text-amber-500">
                          Pending
                        </Badge>
                      ) : (
                        <Badge variant="secondary">User</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(profile.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {!profile.is_seller && !profile.seller_request_pending && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleApproveSeller(profile.id)}
                        >
                          <Store className="h-3 w-3 mr-1" />
                          Make Seller
                        </Button>
                      )}
                      {profile.is_seller && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive">
                              Revoke Seller
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Revoke seller status?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will remove seller privileges from {profile.display_name || "this user"}.
                                Their products will no longer be visible on the marketplace.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleRevokeSeller(profile.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Revoke
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersSection;
