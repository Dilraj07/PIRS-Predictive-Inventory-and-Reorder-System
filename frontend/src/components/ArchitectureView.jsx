import React from 'react';
import { Card } from './Card';
import { useLanguage } from '../contexts/LanguageContext';

export function ArchitectureView() {
  const { t } = useLanguage();

  const structures = [
    {
      title: "Max-Heap Priority Queue",
      role: "Logistical Triage",
      desc: "Used in the 'Triage Board' to ensure the most critical orders (Expiring, VIP) are processed first. New orders are inserted in O(log n) time.",
      image: "/assets/ds_priority_queue_heap_1768486575360.png",
      complexity: "O(log n)"
    },
    {
      title: "Binary Search Tree (BST)",
      role: "Inventory Intelligence",
      desc: "Used in the 'Inventory' tab to organize products by stability days. Allows for efficient range queries to find all 'Critical' items instantly.",
      image: "/assets/ds_bst_inventory_1768486595168.png",
      complexity: "O(log n) Search"
    },
    {
      title: "Circular Linked List",
      role: "Audit Fairness",
      desc: "Used for the 'Audit Schedule' to guarantee a continuous, round-robin check of all inventory slots, ensuring nothing is ever missed.",
      image: "/assets/ds_circular_linked_list_1768486616600.png",
      complexity: "O(1) Next Step"
    },
    {
      title: "Hash Map / Dictionary",
      role: "Instant Access",
      desc: "The backbone of the entire system. Allows O(1) constant-time lookup of any product's details using its unique SKU.",
      image: "/assets/ds_hash_map_lookup_1768486644574.png",
      complexity: "O(1) Access"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">System Architecture & Data Structures</h2>
        <p className="text-slate-500 text-sm">Visualizing the algorithmic backbone of the Predictive Inventory System.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {structures.map((ds, index) => (
          <Card key={index} title={ds.title}>
            <div className="space-y-4">
              <div className="aspect-video bg-slate-50 rounded-lg overflow-hidden border border-slate-100 flex items-center justify-center p-4">
                <img
                  src={ds.image}
                  alt={ds.title}
                  className="w-full h-full object-contain hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    {ds.role}
                  </span>
                  <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded">
                    {ds.complexity}
                  </span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {ds.desc}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
