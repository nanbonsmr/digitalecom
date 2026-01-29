import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Store,
  Package,
  ShieldCheck,
  Loader2,
  CheckCircle,
  XCircle,
  Search,
  AlertTriangle,
  Crown,
  FileCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/marketplace/Navbar";
import ProductModerationSection from "@/components/admin/ProductModerationSection";

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

interface Stats {
  totalUsers: number;
  totalSellers: number;
  totalProducts: number;
  pendingRequests: number;
  pendingProducts: number;
}

const Admin = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalSellers: 0,
    totalProducts: 0,
    pendingRequests: 0,
    pendingProducts: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setCheckingAdmin(false);
        return;
      }

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!error && data) {
        setIsAdmin(true);
      }
      setCheckingAdmin(false);
    };

    if (!loading) {
      checkAdminStatus();
    }
  }, [user, loading]);

  // Redirect if not admin
  useEffect(() => {
    if (!loading && !checkingAdmin) {
      if (!user) {
        navigate("/auth");
      } else if (!isAdmin) {
        navigate("/");
        toast({
          title: "Access Denied",
          description: "You don't have permission to access the admin panel.",
          variant: "destructive",
        });
      }
    }
  }, [user, loading, checkingAdmin, isAdmin, navigate, toast]);

  // Fetch all data
  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch all profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;
      setProfiles(profilesData || []);

      // Fetch user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;
      setUserRoles(rolesData || []);

      // Fetch stats
      const { count: productCount } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true });

      const { count: pendingProductCount } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("moderation_status", "pending");

      const sellers = profilesData?.filter((p) => p.is_seller) || [];
      const pending = profilesData?.filter((p) => p.seller_request_pending) || [];

      setStats({
        totalUsers: profilesData?.length || 0,
        totalSellers: sellers.length,
        totalProducts: productCount || 0,
        pendingRequests: pending.length,
        pendingProducts: pendingProductCount || 0,
      });
    } catch (error: any) {
      toast({
        title: "Error loading data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveSeller = async (profileId: string, userId: string) => {
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
      fetchData();
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
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error revoking seller",
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
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error rejecting request",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getUserRole = (userId: string): string => {
    const role = userRoles.find((r) => r.user_id === userId);
    return role?.role || "user";
  };

  const filteredProfiles = profiles.filter(
    (profile) =>
      profile.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.user_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingRequests = profiles.filter((p) => p.seller_request_pending);

  if (loading || checkingAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage users, sellers, and platform settings</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-5 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Sellers</CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSellers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
            </CardContent>
          </Card>
          <Card className={stats.pendingProducts > 0 ? "border-primary/50" : ""}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Products</CardTitle>
              <FileCheck className={`h-4 w-4 ${stats.pendingProducts > 0 ? "text-primary" : "text-muted-foreground"}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stats.pendingProducts > 0 ? "text-primary" : ""}`}>
                {stats.pendingProducts}
              </div>
            </CardContent>
          </Card>
          <Card className={stats.pendingRequests > 0 ? "border-amber-500/50" : ""}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Seller Requests</CardTitle>
              <AlertTriangle className={`h-4 w-4 ${stats.pendingRequests > 0 ? "text-amber-500" : "text-muted-foreground"}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stats.pendingRequests > 0 ? "text-amber-500" : ""}`}>
                {stats.pendingRequests}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList>
            <TabsTrigger value="products" className="relative">
              Products
              {stats.pendingProducts > 0 && (
                <span className="ml-2 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                  {stats.pendingProducts}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="users">All Users</TabsTrigger>
            <TabsTrigger value="sellers">Sellers</TabsTrigger>
            <TabsTrigger value="pending" className="relative">
              Seller Requests
              {stats.pendingRequests > 0 && (
                <span className="ml-2 h-5 w-5 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center">
                  {stats.pendingRequests}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-4">
            <ProductModerationSection onProductModerated={fetchData} />
          </TabsContent>

          {/* All Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>View and manage all registered users</CardDescription>
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
                                onClick={() => handleApproveSeller(profile.id, profile.user_id)}
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
          </TabsContent>

          {/* Sellers Tab */}
          <TabsContent value="sellers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Active Sellers</CardTitle>
                <CardDescription>Users with seller privileges</CardDescription>
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
                        <TableHead>Seller</TableHead>
                        <TableHead>Bio</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {profiles
                        .filter((p) => p.is_seller)
                        .map((profile) => (
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
                      {profiles.filter((p) => p.is_seller).length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                            No active sellers yet
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pending Requests Tab */}
          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending Seller Requests</CardTitle>
                <CardDescription>Review and approve seller applications</CardDescription>
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
                        className="flex items-center justify-between p-4 rounded-lg border border-border bg-card"
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
                            onClick={() => handleApproveSeller(profile.id, profile.user_id)}
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
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
