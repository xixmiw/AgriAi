import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface ManageFeedsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  livestockId: string;
}

interface Feed {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  pricePerUnit?: string;
}

export function ManageFeedsDialog({ open, onOpenChange, livestockId }: ManageFeedsDialogProps) {
  const queryClient = useQueryClient();
  const [newFeed, setNewFeed] = useState({ name: "", quantity: "", unit: "кг", pricePerUnit: "" });

  const { data: feeds = [] } = useQuery<Feed[]>({
    queryKey: [`/api/livestock/${livestockId}/feeds`],
    enabled: open && !!livestockId,
  });

  const addFeedMutation = useMutation({
    mutationFn: async (feed: typeof newFeed) => {
      const res = await fetch(`/api/livestock/${livestockId}/feeds`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(feed),
      });
      if (!res.ok) throw new Error("Failed to add feed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/livestock/${livestockId}/feeds`] });
      setNewFeed({ name: "", quantity: "", unit: "кг", pricePerUnit: "" });
    },
  });

  const deleteFeedMutation = useMutation({
    mutationFn: async (feedId: string) => {
      const res = await fetch(`/api/feeds/${feedId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete feed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/livestock/${livestockId}/feeds`] });
    },
  });

  const handleAddFeed = () => {
    if (newFeed.name && newFeed.quantity) {
      addFeedMutation.mutate(newFeed);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Управление кормами</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-2">
            <div>
              <Label>Название</Label>
              <Input
                value={newFeed.name}
                onChange={(e) => setNewFeed({ ...newFeed, name: e.target.value })}
                placeholder="Пшеница"
              />
            </div>
            <div>
              <Label>Количество</Label>
              <Input
                type="number"
                value={newFeed.quantity}
                onChange={(e) => setNewFeed({ ...newFeed, quantity: e.target.value })}
                placeholder="100"
              />
            </div>
            <div>
              <Label>Единица</Label>
              <Input
                value={newFeed.unit}
                onChange={(e) => setNewFeed({ ...newFeed, unit: e.target.value })}
                placeholder="кг"
              />
            </div>
            <div>
              <Label>Цена за ед.</Label>
              <Input
                type="number"
                value={newFeed.pricePerUnit}
                onChange={(e) => setNewFeed({ ...newFeed, pricePerUnit: e.target.value })}
                placeholder="40"
              />
            </div>
          </div>
          <Button onClick={handleAddFeed} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Добавить корм
          </Button>

          <div className="space-y-2">
            <h4 className="font-semibold">Текущие корма:</h4>
            {feeds.length === 0 ? (
              <p className="text-sm text-muted-foreground">Корма не добавлены. Добавьте корма для получения анализа ИИ.</p>
            ) : (
              feeds.map((feed) => (
                <div key={feed.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex-1">
                    <span className="font-medium">{feed.name}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      {feed.quantity} {feed.unit}
                      {feed.pricePerUnit && ` по ${feed.pricePerUnit}₸/${feed.unit}`}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteFeedMutation.mutate(feed.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
