'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon, Mic, FileUp, Globe, Calendar, Download, ShoppingCart, Check, Loader2 } from 'lucide-react';

interface BotUpgradeShopProps {
  botId: string;
  botName: string;
  availableUpgrades: {
    imageRecognition: boolean;
    voiceResponse: boolean;
    fileUpload: boolean;
    webSearch: boolean;
    scheduling: boolean;
    dataExport: boolean;
  };
}

const UPGRADE_INFO: Record<string, any> = {
  imageRecognition: {
    name: 'Image Recognition',
    icon: ImageIcon,
    emoji: '📷',
    description: 'Analyze and understand uploaded images',
    price: 4.99,
    color: 'purple',
  },
  voiceResponse: {
    name: 'Voice Response',
    icon: Mic,
    emoji: '🎤',
    description: 'Get audio responses from your bot',
    price: 2.99,
    color: 'blue',
  },
  fileUpload: {
    name: 'File Upload',
    icon: FileUp,
    emoji: '📁',
    description: 'Upload documents for analysis',
    price: 3.99,
    color: 'green',
  },
  webSearch: {
    name: 'Web Search',
    icon: Globe,
    emoji: '🌐',
    description: 'Access real-time web information',
    price: 5.99,
    color: 'cyan',
  },
  scheduling: {
    name: 'Scheduling',
    icon: Calendar,
    emoji: '📅',
    description: 'Set reminders and schedule tasks',
    price: 3.99,
    color: 'orange',
  },
  dataExport: {
    name: 'Data Export',
    icon: Download,
    emoji: '💾',
    description: 'Export conversations and reports',
    price: 2.99,
    color: 'pink',
  },
};

const getColorClasses = (color: string) => {
  const colors: Record<string, string> = {
    purple: 'bg-purple-600/20 text-purple-300 border-purple-500/50 hover:bg-purple-600/30',
    blue: 'bg-blue-600/20 text-blue-300 border-blue-500/50 hover:bg-blue-600/30',
    green: 'bg-green-600/20 text-green-300 border-green-500/50 hover:bg-green-600/30',
    cyan: 'bg-cyan-600/20 text-cyan-300 border-cyan-500/50 hover:bg-cyan-600/30',
    orange: 'bg-orange-600/20 text-orange-300 border-orange-500/50 hover:bg-orange-600/30',
    pink: 'bg-pink-600/20 text-pink-300 border-pink-500/50 hover:bg-pink-600/30',
  };
  return colors[color] || colors.purple;
};

export function BotUpgradeShop({ botId, botName, availableUpgrades }: BotUpgradeShopProps) {
  const [purchasedUpgrades, setPurchasedUpgrades] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    loadPurchasedUpgrades();
  }, [botId]);

  const loadPurchasedUpgrades = async () => {
    try {
      const response = await fetch(`/api/bots/upgrades/purchase?botId=${botId}`);
      if (response.ok) {
        const data = await response.json();
        setPurchasedUpgrades(data.map((u: any) => u.upgradeType));
      }
    } catch (error) {
      console.error('Failed to load upgrades:', error);
    } finally {
      setLoading(false);
    }
  };

  const purchaseUpgrade = async (upgradeType: string) => {
    setPurchasing(upgradeType);
    try {
      const response = await fetch('/api/bots/upgrades/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botId, upgradeType }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Failed to purchase upgrade');
        return;
      }

      alert(data.message);
      loadPurchasedUpgrades();
    } catch (error) {
      console.error('Error purchasing upgrade:', error);
      alert('Failed to purchase upgrade');
    } finally {
      setPurchasing(null);
    }
  };

  const availableUpgradesList = Object.entries(availableUpgrades)
    .filter(([_, enabled]) => enabled)
    .map(([type]) => type);

  if (availableUpgradesList.length === 0) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-500/30">
      <CardHeader>
        <CardTitle className="text-2xl font-orbitron text-white flex items-center gap-2">
          <ShoppingCart className="w-6 h-6 text-purple-400" />
          Power-Up Shop
        </CardTitle>
        <p className="text-gray-400">Enhance {botName} with premium capabilities</p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {availableUpgradesList.map((upgradeType) => {
              const info = UPGRADE_INFO[upgradeType];
              const isPurchased = purchasedUpgrades.includes(upgradeType);
              const Icon = info.icon;

              return (
                <Card key={upgradeType} className={`${getColorClasses(info.color)} border transition-all`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-${info.color}-500/20`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-white">{info.name}</h4>
                          <p className="text-xs opacity-80">{info.description}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold text-white">
                        ${info.price}
                        <span className="text-sm text-gray-400 ml-1">one-time</span>
                      </div>
                      
                      {isPurchased ? (
                        <Badge className="bg-green-600/90 text-white border-green-500">
                          <Check className="w-4 h-4 mr-1" />
                          Owned
                        </Badge>
                      ) : (
                        <Button
                          onClick={() => purchaseUpgrade(upgradeType)}
                          disabled={purchasing !== null}
                          size="sm"
                          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold"
                        >
                          {purchasing === upgradeType ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                              Buying...
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="w-4 h-4 mr-1" />
                              Buy Now
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Bundle Deal */}
        {availableUpgradesList.length > 3 && (
          <div className="mt-6 bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-500/50 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xl font-bold text-yellow-300 mb-1">🎁 Bundle Deal</h4>
                <p className="text-gray-300">Get all upgrades for this bot at 30% off!</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-yellow-400">
                  ${(availableUpgradesList.reduce((sum, type) => sum + UPGRADE_INFO[type].price, 0) * 0.7).toFixed(2)}
                </div>
                <Button
                  size="lg"
                  className="mt-2 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-bold"
                >
                  Buy Bundle
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


