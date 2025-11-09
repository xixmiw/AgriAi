import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface ManageFertilizersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fieldId: string;
}

interface Fertilizer {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  pricePerUnit?: string;
  applicationDate?: string;
}

export function ManageFertilizersDialog({ open, onOpenChange, fieldId }: ManageFertilizersDialogProps) {
  const queryClient = useQueryClient();
  const [newFertilizer, setNewFertilizer] = useState({
    name: "",
    quantity: "",
    unit: "кг",
    pricePerUnit: "",
    applicationDate: "",
  });

  const { data: fertilizers = [] } = useQuery<Fertilizer[]>({
    queryKey: [`/api/fields/${fieldId}/fertilizers`],
    enabled: open && !!fieldId,
  });

  const addFertilizerMutation = useMutation({
    mutationFn: async (fertilizer: typeof newFertilizer) => {
      const res = await fetch(`/api/fields/${fieldId}/fertilizers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(fertilizer),
      });
      if (!res.ok) throw new Error("Failed to add fertilizer");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/fields/${fieldId}/fertilizers`] });
      setNewFertilizer({ name: "", quantity: "", unit: "кг", pricePerUnit: "", applicationDate: "" });
    },
  });

  const deleteFertilizerMutation = useMutation({
    mutationFn: async (fertilizerId: string) => {
      const res = await fetch(`/api/fertilizers/${fertilizerId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete fertilizer");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/fields/${fieldId}/fertilizers`] });
    },
  });

  const handleAddFertilizer = () => {
    if (newFertilizer.name && newFertilizer.quantity) {
      addFertilizerMutation.mutate(newFertilizer);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Управление удобрениями</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <div className="col-span-1">
              <Label>Название</Label>
              <Input
                value={newFertilizer.name}
                onChange={(e) => setNewFertilizer({ ...newFertilizer, name: e.target.value })}
                placeholder="Азот"
              />
            </div>
            <div>
              <Label>Количество</Label>
              <Input
                type="number"
                value={newFertilizer.quantity}
                onChange={(e) => setNewFertilizer({ ...newFertilizer, quantity: e.target.value })}
                placeholder="100"
              />
            </div>
            <div>
              <Label>Единица</Label>
              <Input
                value={newFertilizer.unit}
                onChange={(e) => setNewFertilizer({ ...newFertilizer, unit: e.target.value })}
                placeholder="кг"
              />
            </div>
            <div>
              <Label>Цена</Label>
              <Input
                type="number"
                value={newFertilizer.pricePerUnit}
                onChange={(e) => setNewFertilizer({ ...newFertilizer, pricePerUnit: e.target.value })}
                placeholder="8000"
              />
            </div>
            <div>
              <Label>Дата внесения</Label>
              <Input
                type="date"
                value={newFertilizer.applicationDate}
                onChange={(e) => setNewFertilizer({ ...newFertilizer, applicationDate: e.target.value })}
              />
            </div>
          </div>
          <Button onClick={handleAddFertilizer} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Добавить удобрение
          </Button>

          <div className="space-y-2">
            <h4 className="font-semibold">Текущие удобрения:</h4>
            {fertilizers.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Удобрения не добавлены. Добавьте удобрения для получения анализа ИИ.
              </p>
            ) : (
              fertilizers.map((fertilizer) => (
                <div key={fertilizer.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex-1">
                    <span className="font-medium">{fertilizer.name}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      {fertilizer.quantity} {fertilizer.unit}
                      {fertilizer.pricePerUnit && ` по ${fertilizer.pricePerUnit}₸/${fertilizer.unit}`}
                      {fertilizer.applicationDate &&
                        ` (${new Date(fertilizer.applicationDate).toLocaleDateString("ru-RU")})`}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteFertilizerMutation.mutate(fertilizer.id)}
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
