import {
  Store,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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

interface SellersSectionProps {
  profiles: Profile[];
  isLoading: boolean;
  onDataChange: () => void;
}

const SellersSection = ({ profiles, isLoading, onDataChange }: SellersSectionProps) => {
  const { toast } = useToast();

  const sellers = profiles.filter((p) => p.is_seller);

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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Active Sellers</h2>
        <p className="text-muted-foreground">Manage users with seller privileges</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Sellers
          </CardTitle>
          <CardDescription>{sellers.length} active sellers</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : sellers.length === 0 ? (
            <div className="text-center py-12">
              <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No active sellers</h3>
              <p className="text-muted-foreground">
                Approve seller requests to see them here.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Seller</TableHead>
                  <TableHead>Bio</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sellers.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={profile.avatar_url || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {profile.display_name?.charAt(0) || "S"}
                          </AvatarFallback>
                        </Avatar>
                        <p className="font-medium">{profile.display_name || "No Name"}</p>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate text-muted-foreground">
                      {profile.bio || "No bio"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(profile.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
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

export default SellersSection;
