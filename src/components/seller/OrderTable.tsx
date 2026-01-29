import { Eye, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Order {
  id: string;
  productName: string;
  buyerEmail: string;
  date: string;
  price: number;
  status: "paid" | "refunded" | "pending";
  downloads: number;
}

interface OrderTableProps {
  orders: Order[];
  onViewOrder?: (orderId: string) => void;
}

export const OrderTable = ({ orders, onViewOrder }: OrderTableProps) => {
  const getStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-success/20 text-success border-0">Paid</Badge>;
      case "refunded":
        return <Badge className="bg-destructive/20 text-destructive border-0">Refunded</Badge>;
      case "pending":
        return <Badge className="bg-warning/20 text-warning border-0">Pending</Badge>;
    }
  };

  return (
    <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">Recent Orders</h3>
        <p className="text-sm text-muted-foreground mt-1">Latest purchases from your customers</p>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="font-semibold">Order ID</TableHead>
              <TableHead className="font-semibold">Product</TableHead>
              <TableHead className="font-semibold hidden md:table-cell">Buyer</TableHead>
              <TableHead className="font-semibold hidden sm:table-cell">Date</TableHead>
              <TableHead className="font-semibold">Price</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold hidden lg:table-cell">Downloads</TableHead>
              <TableHead className="font-semibold text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id} className="hover:bg-muted/20 transition-colors">
                <TableCell className="font-mono text-sm">{order.id}</TableCell>
                <TableCell className="font-medium max-w-[150px] truncate">
                  {order.productName}
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">
                  {order.buyerEmail}
                </TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">
                  {order.date}
                </TableCell>
                <TableCell className="font-semibold">${order.price.toFixed(2)}</TableCell>
                <TableCell>{getStatusBadge(order.status)}</TableCell>
                <TableCell className="hidden lg:table-cell">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Download className="h-4 w-4" />
                    {order.downloads}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onViewOrder?.(order.id)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default OrderTable;
