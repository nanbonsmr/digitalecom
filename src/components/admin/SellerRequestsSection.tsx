import {
  CheckCircle,
  XCircle,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

interface SellerRequestsSectionProps {
  profiles: Profile[];
  isLoading: boolean;
  onDataChange: () => void;
}

const SellerRequestsSection = ({ profiles, isLoading, onDataChange }: SellerRequestsSectionProps) => {
  const { toast } = useToast();

  const pendingRequests = profiles.filter((p) => p.seller_request_pending);

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

  const handleRejectRequest = async (profileId: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ seller_request_pending: false })
        .eq("id", profileId);

      if (error) throw error;

      toast({
        title: "Request rejected",
        description: "Seller request has been rejected.",
      });
      onDataChange();
    } catch (error: any) {
      toast({
        title: "Error rejecting request",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Seller Requests</h2>
        <p className="text-muted-foreground">Review and approve seller applications</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Pending Requests
          </CardTitle>
          <CardDescription>{pendingRequests.length} pending applications</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : pendingRequests.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
              <p className="text-muted-foreground">No pending seller requests to review.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((profile) => (
                <div
                  key={profile.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={profile.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {profile.display_name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{profile.display_name || "No Name"}</p>
                      <p className="text-sm text-muted-foreground">
                        {profile.bio || "No bio provided"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Requested: {new Date(profile.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApproveSeller(profile.id)}
                      className="bg-success hover:bg-success/90"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRejectRequest(profile.id)}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SellerRequestsSection;
