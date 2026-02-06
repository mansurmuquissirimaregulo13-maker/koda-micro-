import React, { useState } from 'react';
import { Client } from '../utils/mockData';
import { Upload, FileText } from 'lucide-react';
interface ClientFormProps {
  onSubmit: (data: Omit<Client, 'id' | 'registeredAt'>) => void;
  onCancel: () => void;
  initialData?: Client;
}
export function ClientForm({
  onSubmit,
  onCancel,
  initialData
}: ClientFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    bi: initialData?.bi || '',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    address: initialData?.address || '',
    notes: initialData?.notes || '',
    residenceProof: initialData?.residenceProof || ''
  });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // In a real app, we'd upload this. Here we just store the name.
      setFormData({
        ...formData,
        residenceProof: e.target.files[0].name
      });
    }
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Nome Completo
          </label>
          <input
            required
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#40916C] focus:border-transparent outline-none"
            value={formData.name}
            onChange={(e) =>
            setFormData({
              ...formData,
              name: e.target.value
            })
            }
            placeholder="Ex: João Macamo" />

        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            BI / Passaporte
          </label>
          <input
            required
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#40916C] focus:border-transparent outline-none"
            value={formData.bi}
            onChange={(e) =>
            setFormData({
              ...formData,
              bi: e.target.value
            })
            }
            placeholder="Ex: 11029384750B" />

        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Telefone</label>
          <input
            required
            type="tel"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#40916C] focus:border-transparent outline-none"
            value={formData.phone}
            onChange={(e) =>
            setFormData({
              ...formData,
              phone: e.target.value
            })
            }
            placeholder="Ex: +258 84 123 4567" />

        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#40916C] focus:border-transparent outline-none"
            value={formData.email}
            onChange={(e) =>
            setFormData({
              ...formData,
              email: e.target.value
            })
            }
            placeholder="Ex: cliente@email.com" />

        </div>

        <div className="col-span-1 md:col-span-2 space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Endereço / Residência
          </label>
          <textarea
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#40916C] focus:border-transparent outline-none"
            rows={2}
            value={formData.address}
            onChange={(e) =>
            setFormData({
              ...formData,
              address: e.target.value
            })
            }
            placeholder="Endereço completo..." />

        </div>

        <div className="col-span-1 md:col-span-2 space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Comprovativo de Residência
          </label>
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {formData.residenceProof ?
                <>
                    <FileText className="w-8 h-8 text-[#40916C] mb-2" />
                    <p className="text-sm text-gray-500 font-medium">
                      {formData.residenceProof}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Clique para alterar
                    </p>
                  </> :

                <>
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">
                      <span className="font-semibold">Clique para enviar</span>{' '}
                      ou arraste
                    </p>
                    <p className="text-xs text-gray-500">
                      PDF, PNG, JPG (MAX. 5MB)
                    </p>
                  </>
                }
              </div>
              <input
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png" />

            </label>
          </div>
        </div>

        <div className="col-span-1 md:col-span-2 space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Observações (Fiador, Notas)
          </label>
          <textarea
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#40916C] focus:border-transparent outline-none"
            rows={3}
            value={formData.notes}
            onChange={(e) =>
            setFormData({
              ...formData,
              notes: e.target.value
            })
            }
            placeholder="Ex: Fiador: António Silva, Cliente recomendado..." />

        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">

          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-[#1B3A2D] rounded-lg hover:bg-[#2D6A4F]">

          {initialData ? 'Atualizar Cliente' : 'Cadastrar Cliente'}
        </button>
      </div>
    </form>);

}