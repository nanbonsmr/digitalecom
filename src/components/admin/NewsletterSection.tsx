import { useState, useEffect } from "react";
import {
  Mail,
  Search,
  Download,
  Loader2,
  UserCheck,
  UserX,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Subscriber {
  id: string;
  email: string;
  subscribed_at: string;
  is_active: boolean;
}

const NewsletterSection = () => {
  const { toast } = useToast();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("newsletter_subscribers")
        .select("*")
        .order("subscribed_at", { ascending: false });

      if (error) throw error;
      setSubscribers(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching subscribers",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSubscriberStatus = async (subscriber: Subscriber) => {
    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .update({ is_active: !subscriber.is_active })
        .eq("id", subscriber.id);

      if (error) throw error;

      setSubscribers(prev =>
        prev.map(s =>
          s.id === subscriber.id ? { ...s, is_active: !s.is_active } : s
        )
      );

      toast({
        title: subscriber.is_active ? "Subscriber deactivated" : "Subscriber activated",
        description: `${subscriber.email} has been ${subscriber.is_active ? "deactivated" : "activated"}.`,
      });
    } catch (error: any) {
      toast({
        title: "Error updating subscriber",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const exportToCSV = () => {
    const activeSubscribers = subscribers.filter(s => s.is_active);
    const csv = [
      ["Email", "Subscribed Date", "Status"],
      ...activeSubscribers.map(s => [
        s.email,
        new Date(s.subscribed_at).toLocaleDateString(),
        s.is_active ? "Active" : "Inactive",
      ]),
    ]
      .map(row => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export complete",
      description: `Exported ${activeSubscribers.length} active subscribers.`,
    });
  };

  const filteredSubscribers = subscribers.filter(s =>
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = subscribers.filter(s => s.is_active).length;
  const inactiveCount = subscribers.filter(s => !s.is_active).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Newsletter Subscribers</h2>
          <p className="text-muted-foreground">
            {subscribers.length} total subscribers
          </p>
        </div>
        <Button onClick={exportToCSV} disabled={activeCount === 0}>
          <Download className="h-4 w-4 mr-2" />
          Export Active ({activeCount})
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscribers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <UserCheck className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{activeCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">{inactiveCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by email..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Subscribers Table */}
      <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredSubscribers.length === 0 ? (
          <div className="text-center py-12">
            <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium text-foreground mb-1">No subscribers found</h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery
                ? "Try a different search term"
                : "Subscribers will appear here when users sign up"}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Subscribed</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubscribers.map((subscriber) => (
                <TableRow key={subscriber.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{subscriber.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {new Date(subscriber.subscribed_at).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={subscriber.is_active ? "default" : "secondary"}
                      className={subscriber.is_active ? "bg-success/10 text-success border-success/20" : ""}
                    >
                      {subscriber.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSubscriberStatus(subscriber)}
                    >
                      {subscriber.is_active ? (
                        <>
                          <UserX className="h-4 w-4 mr-1" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <UserCheck className="h-4 w-4 mr-1" />
                          Activate
                        </>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default NewsletterSection;
