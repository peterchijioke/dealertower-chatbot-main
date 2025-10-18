'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDealer, useDealerStore } from '@/stores/dealer-store';
import { setDealerIdServer } from '@/lib/auth-server';


export function DealerSelectionOverlay() {

  const { selectedDealer,dealers,setSelectedDealer } = useDealerStore();

 
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-sidebar rounded-lg shadow-none  max-w-md w-full p-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-btn">SELECT YOUR DEALER</h2>
          <p className=" text-sm text-btn">
            Please select your dealer to continue with the chat
          </p>
        </div>

        <div className="space-y-4">
          <Select 
          disabled={dealers?.length === 0}
            value={selectedDealer?.name} 
            onValueChange={async (value) => {
              const dealer=dealers.find(dealer => dealer.id === value)
              setSelectedDealer(dealers.find(dealer => dealer.id === value) || null);
              await setDealerIdServer(dealer?.id!);
            }}
          > 
            <SelectTrigger className="w-full bg-btn text-sidebar border-none rounded-full outline-none focus-visible:ring-transparent focus-visible:outline-none focus:ring-0">
              <SelectValue
                placeholder={"Select..."}
              />
            </SelectTrigger>
            <SelectContent >

              {Array.isArray(dealers) && dealers.map((dealer) => (
                <SelectItem key={dealer.id} value={dealer.id} className="flex items-center">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{dealer.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
