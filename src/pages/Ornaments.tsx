import { useState } from 'react';
import { useData } from '@/context/DataContext';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Weight } from 'lucide-react';
import { toast } from 'sonner';

const Ornaments = () => {
  const { ornaments, addOrnaments } = useData();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'gold' as 'gold' | 'silver',
    grossWeight: '',
    netWeight: '',
    interest: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    addOrnaments([{
      billId: 'TEMPLATE', // Template ornament for reuse
      name: formData.name,
      type: formData.type,
      grossWeight: parseFloat(formData.grossWeight),
      netWeight: parseFloat(formData.netWeight),
      interest: parseFloat(formData.interest),
    }]);

    toast.success('Ornament template created successfully!');
    setFormData({
      name: '',
      type: 'gold',
      grossWeight: '',
      netWeight: '',
      interest: '',
    });
    setOpen(false);
  };

  // Get unique ornament templates (from TEMPLATE bills)
  const ornamentTemplates = ornaments.filter(o => o.billId === 'TEMPLATE');

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Ornaments</h1>
            <p className="text-muted-foreground">Manage ornament templates for bills</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Ornament Template
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Ornament Template</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Ornament Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Gold Chain, Silver Ring"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Metal Type</Label>
                  <Select value={formData.type} onValueChange={(value: 'gold' | 'silver') => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gold">Gold</SelectItem>
                      <SelectItem value="silver">Silver</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="grossWeight">Gross Weight (g)</Label>
                    <Input
                      id="grossWeight"
                      type="number"
                      step="0.01"
                      value={formData.grossWeight}
                      onChange={(e) => setFormData({ ...formData, grossWeight: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="netWeight">Net Weight (g)</Label>
                    <Input
                      id="netWeight"
                      type="number"
                      step="0.01"
                      value={formData.netWeight}
                      onChange={(e) => setFormData({ ...formData, netWeight: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interest">Interest Rate (%)</Label>
                  <Input
                    id="interest"
                    type="number"
                    step="0.1"
                    value={formData.interest}
                    onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                    required
                  />
                </div>

                <Button type="submit" className="w-full">
                  Create Template
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ornamentTemplates.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Weight className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  No ornament templates yet. Create one to get started!
                </p>
              </CardContent>
            </Card>
          ) : (
            ornamentTemplates.map((ornament) => (
              <Card key={ornament.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{ornament.name}</span>
                    <Badge variant={ornament.type === 'gold' ? 'default' : 'secondary'}>
                      {ornament.type}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Gross Weight:</span>
                      <span className="font-semibold">{ornament.grossWeight}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Net Weight:</span>
                      <span className="font-semibold">{ornament.netWeight}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Interest Rate:</span>
                      <span className="font-semibold">{ornament.interest}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Ornaments;
