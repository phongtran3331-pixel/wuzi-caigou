import type { PurchaseItem, PurchaseList } from '@/types/procurement'
import { genId } from '@/lib/procurement-utils'

function item(partial: Partial<PurchaseItem> & { name: string }): PurchaseItem {
  return {
    id: genId(),
    quantity: '',
    note: '',
    link: '',
    price: null,
    invoice: 'unknown',
    purchased: false,
    purchaser: '',
    signature: null,
    purchasedAt: null,
    ...partial,
  }
}

/** 拼豆活动物资采购清单 —— 数据来自《拼豆活动物资(2).xlsx》 */
export function createSeedLists(): PurchaseList[] {
  const items: PurchaseItem[] = [
    item({
      name: '成品小包装固定图案材料包',
      quantity: '30包 ×1',
      note: '选30包的，x1（这个只有10种图案）',
      link: 'https://e.tb.cn/h.j5cF6H6pPUyNaFZ?tk=UDAzTA9ECez',
      price: 28.68,
      invoice: 'yes',
    }),
    item({
      name: '成品小包装固定图案材料包（备选）',
      quantity: '40包 ×1',
      note: '同款备选方案：40包',
      link: 'https://mobile.yangkeduo.com/goods2.html?ps=L4wCeFbBrA',
      price: 30.94,
      invoice: 'yes',
    }),
    item({
      name: '成品小包装固定图案材料包（备选）',
      quantity: '50包 ×1',
      note: '同款备选方案：50包',
      link: 'https://mobile.yangkeduo.com/goods.html?ps=QLoXnh2Mkr',
      price: 35.26,
      invoice: 'yes',
    }),
    item({
      name: '拼豆专用熨斗 24V 小功率',
      quantity: '2台',
      note: '拼豆专用熨斗；小粉熨斗',
      link: 'https://e.tb.cn/h.j5wkGwH046hKAk0?tk=XzvvTBeuoVy',
      price: 29.8,
      invoice: 'yes',
    }),
    item({
      name: '专用烫画机',
      quantity: '2台',
      note: '酷酷紫白绿，160度恒温',
      link: 'https://e.tb.cn/h.j4xR6vafDSijzCO?tk=8blBTBeGgXM',
      price: 61.85,
      invoice: 'yes',
    }),
    item({
      name: '拼豆多色补充包',
      quantity: '1套',
      note: '72色 1000颗/包，共1份',
      link: 'https://e.tb.cn/h.jgm3HXrNWnFyfOJ?tk=aMX7TAOBMvH',
      price: 32.3,
      invoice: 'yes',
    }),
    item({
      name: '共创展板',
      quantity: '1块',
      note: '60 × 80（毛毡展示板）',
      link: 'https://e.tb.cn/h.jgQP33ENBhqSYrz?tk=tnMkTBG1NH1',
      price: 35.9,
      invoice: 'yes',
    }),
    item({
      name: '工字钉',
      quantity: '2盒',
      note: '展板自带，无需单独采购',
    }),
    item({
      name: '串绳',
      quantity: '200条盒装 ×1',
      note: '买200条盒装，送打孔器',
      link: 'https://e.tb.cn/h.jU17oT0eUp1mKJy?tk=ImErTANLR7n',
      price: 13.8,
      invoice: 'yes',
    }),
    item({
      name: '马卡龙星星拼豆挂绳',
      quantity: '30个',
      note: '30个装（弹簧圈防丢绳）',
      link: 'https://e.tb.cn/h.jS9prIQhdz62V4P?tk=0tpO6ZxqN3Q',
      price: 22.4,
      invoice: 'yes',
    }),
    item({
      name: '拼豆挂绳（备选）',
      quantity: '30个',
      note: '同款备选：30个装',
      link: 'https://mobile.yangkeduo.com/goods1.html?ps=AfwYVyDMuZ',
      price: 8.2,
      invoice: 'yes',
    }),
    item({
      name: '亚克力拼豆钥匙扣',
      quantity: '20个',
      note: '混五色20个款，送开口圈',
      link: 'https://e.tb.cn/h.jg6ZxGXiaaMqHXn?tk=tQef6ZDfIgK',
      price: 13.29,
      invoice: 'yes',
    }),
    item({
      name: '钥匙扣混色装（备选）',
      quantity: '10条',
      note: '同款备选：混色10条装',
      link: 'https://mobile.yangkeduo.com/goods.html?ps=ObPQxoPqzF',
      price: 9.1,
      invoice: 'yes',
    }),
  ]

  return [
    {
      id: genId(),
      name: '拼豆活动物资采购',
      remark: '“睿”心缀彩 · 方寸温情——社区拼豆活动',
      createdAt: '2026-11-04',
      items,
    },
  ]
}
