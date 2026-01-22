
import React, { useState, useEffect } from 'react';
import { Company, Collaborator } from '../types';
import { getCollaboratorsByCompany } from '../services/inventoryService';

interface CollaboratorListProps {
  company: Company;
}

const CollaboratorList: React.FC<CollaboratorListProps> = ({ company }) => {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);

  useEffect(() => {
    setCollaborators(getCollaboratorsByCompany(company.id));
  }, [company]);

  return (
    <div className="animate-in fade-in duration-500">
       <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Colaboradores</h1>
          <p className="text-gray-500">Responsables de activos en {company.name}</p>
        </div>
        <button className="bg-emerald-600 text-white px-5 py-2 rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-900/10">
          Nuevo Colaborador
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {collaborators.map((c) => (
          <div key={c.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex gap-5 items-start">
             <img src={`https://picsum.photos/seed/${c.email}/100/100`} className="w-20 h-20 rounded-2xl object-cover ring-2 ring-emerald-100" alt="collaborator" />
             <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-lg truncate">{c.firstName} {c.lastName}</h3>
                <p className="text-emerald-600 text-sm font-semibold">{c.cargo}</p>
                <p className="text-gray-500 text-xs mt-1 italic">{c.area}</p>
                
                <div className="mt-4 flex flex-col gap-1">
                   <div className="flex items-center gap-2 text-xs text-gray-600">
                      <i className="fa-solid fa-envelope w-4"></i>
                      <span className="truncate">{c.email}</span>
                   </div>
                   <div className="flex items-center gap-2 text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded-md mt-2 w-fit">
                      <i className="fa-solid fa-laptop"></i>
                      <span>1 Equipo Asignado</span>
                   </div>
                </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CollaboratorList;
