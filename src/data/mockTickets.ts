import { Ticket } from '@/types';

export const mockTickets: Ticket[] = [
  {
    id: '001',
    title: 'Sistema de PDV travando na abertura',
    client: 'Mercearia São João',
    description:
      'O sistema de ponto de venda trava toda vez que tentamos abrir caixa pela manhã. Precisamos de suporte urgente pois estamos perdendo vendas.',
    status: 'open',
    priority: 'high',
    createdAt: '2025-03-04T08:30:00Z',
  },
  {
    id: '002',
    title: 'Relatório mensal não gera PDF',
    client: 'Farmácia Central',
    description:
      'Ao tentar exportar o relatório de vendas mensais em PDF, a tela fica carregando indefinidamente e nada é gerado.',
    status: 'in_progress',
    priority: 'medium',
    createdAt: '2025-03-03T14:15:00Z',
  },
  {
    id: '003',
    title: 'Atualização de preços no catálogo',
    client: 'Padaria Flor de Lis',
    description:
      'Precisamos atualizar a tabela de preços de todos os produtos de panificação após reajuste do fornecedor.',
    status: 'resolved',
    priority: 'low',
    createdAt: '2025-03-01T09:00:00Z',
  },
  {
    id: '004',
    title: 'Impressora fiscal sem comunicação',
    client: 'Açougue do Seu Zé',
    description:
      'A impressora fiscal ECF parou de comunicar com o sistema. Emissão de cupons fiscais está bloqueada, afetando todas as vendas.',
    status: 'open',
    priority: 'high',
    createdAt: '2025-03-04T11:45:00Z',
  },
  {
    id: '005',
    title: 'Integração com marketplace pausou',
    client: 'Loja do Bairro Online',
    description:
      'A sincronização automática de estoque com o marketplace parou de funcionar há 2 dias. Produtos estão sendo vendidos sem atualização de estoque.',
    status: 'in_progress',
    priority: 'medium',
    createdAt: '2025-03-02T16:20:00Z',
  },
  {
    id: '006',
    title: 'Backup automático falhando',
    client: 'Restaurante Bom Sabor',
    description:
      'O backup noturno automático do banco de dados não está sendo realizado. Último backup bem-sucedido foi há 5 dias.',
    status: 'open',
    priority: 'high',
    createdAt: '2025-03-04T07:00:00Z',
  },
];
