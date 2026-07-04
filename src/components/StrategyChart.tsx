import { useMemo } from 'react';
import type { Strategy } from '@/data/strategies';

interface Candle {
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
  isUp: boolean;
}

function generateData(): Candle[] {
  const candles: Candle[] = [];
  let price = 45 + Math.random() * 10;
  let trend = 0.02;
  for (let i = 0; i < 40; i++) {
    if (i % 10 === 0) trend = (Math.random() - 0.4) * 0.5;
    const change = trend + (Math.random() - 0.48) * 3;
    const open = price;
    const close = price + change;
    const high = Math.max(open, close) + Math.random() * 2;
    const low = Math.min(open, close) - Math.random() * 2;
    const volume = 50 + Math.random() * 80 + Math.abs(change) * 15;
    price = close;
    candles.push({ open, close, high, low, volume, isUp: close >= open });
  }
  return candles;
}

function calcMA(candles: Candle[], period: number): (number | null)[] {
  return candles.map((_, i) => {
    if (i < period - 1) return null;
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) sum += candles[j].close;
    return sum / period;
  });
}

function calcEMA(candles: Candle[], period: number): (number | null)[] {
  const k = 2 / (period + 1);
  const result: (number | null)[] = [];
  let ema: number | null = null;
  for (let i = 0; i < candles.length; i++) {
    if (i < period - 1) { result.push(null); continue; }
    if (ema === null) {
      let sum = 0;
      for (let j = i - period + 1; j <= i; j++) sum += candles[j].close;
      ema = sum / period;
    } else {
      ema = candles[i].close * k + ema * (1 - k);
    }
    result.push(ema);
  }
  return result;
}

interface Props {
  strategy: Strategy;
}

// 游资型专用数据生成：每个策略专属走势
function generateHotMoneyData(strategyId: string): Candle[] {
  const candles: Candle[] = [];
  let price = 30 + Math.random() * 10;
  const r = () => Math.random();

  // 龙头战法：板块启动→首板龙头确认→加速上涨→首次分歧→二波→见顶
  if (strategyId === 'dragon-head') {
    for (let i = 0; i < 40; i++) {
      let change: number;
      if (i < 4) change = 0.3 + r() * 0.8;                        // 底部蓄势
      else if (i === 4) change = price * 0.098;                     // 首板！龙头确认
      else if (i < 8) change = price * (0.07 + r() * 0.03);        // 连续加速
      else if (i === 8) change = -price * (0.02 + r() * 0.02);     // 首次分歧（抗跌）
      else if (i < 12) change = price * (0.04 + r() * 0.04);       // 二波主升
      else if (i < 16) change = (r() - 0.4) * price * 0.03;        // 高位震荡
      else if (i < 20) change = price * (0.02 + r() * 0.03);       // 再冲高
      else change = -price * (0.01 + r() * 0.03);                   // 退潮
      const open = price; const close = price + change;
      const high = Math.max(open, close) + r() * Math.abs(change) * 0.3;
      const low = Math.min(open, close) - r() * Math.abs(change) * 0.3;
      let vol = 50 + r() * 60;
      if (i === 4) vol *= 3.0;
      if (i >= 5 && i < 8) vol *= 2.0 + (i - 5) * 0.3;
      if (i === 8) vol *= 1.5;
      if (i >= 9 && i < 12) vol *= 2.5;
      price = close;
      candles.push({ open, close, high, low, volume: vol, isUp: close >= open });
    }
  }
  // 连板接力战法：1板→2板→3板确认→4板加速→5板分歧→6板→炸板
  else if (strategyId === 'consecutive-board') {
    for (let i = 0; i < 40; i++) {
      let change: number;
      if (i < 3) change = 0.3 + r() * 0.5;                         // 启动
      else if (i === 3) change = price * 0.098;                     // 1板
      else if (i === 4) change = price * 0.097;                     // 2板
      else if (i === 5) change = price * 0.096;                     // 3板（龙头确认）
      else if (i === 6) { change = price * 0.04; }                  // 炸板分歧日
      else if (i === 7) change = price * 0.095;                     // 回封4板
      else if (i === 8) change = price * 0.094;                     // 5板加速
      else if (i === 9) change = price * 0.093;                     // 6板
      else if (i === 10) change = -price * 0.06;                    // 炸板大面
      else if (i < 15) change = -price * (0.01 + r() * 0.02);      // 持续下跌
      else change = (r() - 0.5) * price * 0.02;
      const open = price; const close = price + change;
      const high = Math.max(open, close) + r() * Math.abs(change) * 0.2;
      const low = Math.min(open, close) - r() * Math.abs(change) * 0.2;
      let vol = 40 + r() * 50;
      if (i >= 3 && i <= 5) vol *= 1.5 + (i - 3) * 0.5;
      if (i === 6) vol *= 4.0;   // 分歧日巨量
      if (i === 7) vol *= 2.5;   // 回封量
      if (i >= 8 && i <= 9) vol *= 1.8;
      if (i === 10) vol *= 5.0;  // 炸板恐慌量
      price = close;
      candles.push({ open, close, high, low, volume: vol, isUp: close >= open });
    }
  }
  // 弱转强战法：前日炸板→竞价低开→快速拉涨停→次日继续强
  else if (strategyId === 'weak-to-strong') {
    for (let i = 0; i < 40; i++) {
      let change: number;
      if (i < 5) change = price * (0.03 + r() * 0.04);             // 前期上涨
      else if (i === 5) change = price * 0.095;                     // 首板
      else if (i === 6) change = -price * 0.02;                     // 炸板回落（弱的预期）
      else if (i === 7) {                                           // 弱转强！竞价低开后拉涨停
        change = price * 0.09;
      }
      else if (i === 8) change = price * 0.08;                      // 强势延续
      else if (i < 12) change = price * (0.03 + r() * 0.03);       // 主升段
      else if (i < 18) change = (r() - 0.4) * price * 0.03;        // 高位震荡
      else change = -price * (0.01 + r() * 0.02);
      const open = price; const close = price + change;
      const high = Math.max(open, close) + r() * Math.abs(change) * 0.3;
      const low = Math.min(open, close) - r() * Math.abs(change) * 0.3;
      let vol = 40 + r() * 50;
      if (i === 5) vol *= 2.0;
      if (i === 6) vol *= 3.5;  // 炸板放量
      if (i === 7) vol *= 4.0;  // 弱转强抢筹巨量
      if (i === 8) vol *= 2.5;
      price = close;
      candles.push({ open, close, high, low, volume: vol, isUp: close >= open });
    }
  }
  // 情绪周期战法：冰点→修复→升温→高潮→退潮→冰点
  else if (strategyId === 'sentiment-cycle') {
    for (let i = 0; i < 40; i++) {
      let change: number;
      if (i < 6) change = -price * (0.02 + r() * 0.02);            // 冰点期
      else if (i === 6) change = -price * 0.04;                     // 恐慌最后一天
      else if (i < 10) change = price * (0.01 + r() * 0.02);       // 修复期
      else if (i < 16) change = price * (0.03 + r() * 0.03);       // 升温期
      else if (i === 16) change = price * 0.09;                     // 高潮期涨停
      else if (i === 17) change = price * 0.08;                     // 高潮延续
      else if (i === 18) change = price * 0.07;                     // 高潮
      else if (i === 19) change = -price * 0.03;                    // 退潮开始
      else if (i < 25) change = -price * (0.02 + r() * 0.03);      // 退潮期
      else if (i < 30) change = (r() - 0.5) * price * 0.02;        // 低迷
      else change = -price * (0.01 + r() * 0.02);                   // 再冰点
      const open = price; const close = price + change;
      const high = Math.max(open, close) + r() * Math.abs(change) * 0.3;
      const low = Math.min(open, close) - r() * Math.abs(change) * 0.3;
      let vol = 40 + r() * 50;
      if (i < 6) vol *= 0.5;    // 冰点缩量
      if (i >= 10 && i < 16) vol *= 1.5;  // 升温放量
      if (i >= 16 && i <= 18) vol *= 3.0;  // 高潮巨量
      if (i >= 19 && i < 25) vol *= 2.0;  // 退潮放量
      price = close;
      candles.push({ open, close, high, low, volume: vol, isUp: close >= open });
    }
  }
  // 龙头反包战法：连板→首阴→反包涨停→继续→二阴→走弱
  else if (strategyId === 'pullback-reversal') {
    for (let i = 0; i < 40; i++) {
      let change: number;
      if (i < 4) change = price * (0.02 + r() * 0.02);             // 启动
      else if (i === 4) change = price * 0.095;                     // 首板
      else if (i === 5) change = price * 0.093;                     // 2板
      else if (i === 6) change = price * 0.091;                     // 3板
      else if (i === 7) change = -price * 0.06;                     // 首阴！
      else if (i === 8) change = price * 0.098;                     // 反包涨停！
      else if (i < 12) change = price * (0.03 + r() * 0.03);       // 反包后继续
      else if (i === 12) change = -price * 0.04;                    // 二阴（谨慎）
      else if (i < 16) change = (r() - 0.3) * price * 0.02;        // 走弱
      else change = -price * (0.01 + r() * 0.02);
      const open = price; const close = price + change;
      const high = Math.max(open, close) + r() * Math.abs(change) * 0.3;
      const low = Math.min(open, close) - r() * Math.abs(change) * 0.3;
      let vol = 40 + r() * 50;
      if (i >= 4 && i <= 6) vol *= 2.0;
      if (i === 7) vol *= 3.5;   // 首阴放量
      if (i === 8) vol *= 4.0;   // 反包巨量
      if (i === 12) vol *= 2.5;  // 二阴量
      price = close;
      candles.push({ open, close, high, low, volume: vol, isUp: close >= open });
    }
  }
  // 地天板战法：正常走势→跌停→撬板→快速拉升→涨停
  else if (strategyId === 'extreme-reversal') {
    for (let i = 0; i < 40; i++) {
      let change: number;
      if (i < 8) change = -price * (0.01 + r() * 0.02);            // 前期下跌
      else if (i === 8) change = -price * 0.098;                    // 跌停！
      else if (i === 9) {                                           // 撬板→地天板！
        // 从跌停价开盘，拉到涨停收盘
        const openPrice = price;
        change = price * 0.22; // 从跌停到涨停约20%振幅
        const open = price - price * 0.098; // 跌停价开盘
        const close = open + open * 0.098 * 2; // 涨停价收盘
        const high = close + r() * 1;
        const low = open - r() * 0.5;
        let vol = 300 + r() * 200;
        price = close;
        candles.push({ open, close, high, low, volume: vol, isUp: true });
        continue;
      }
      else if (i === 10) change = price * 0.05;                     // 次日溢价
      else if (i < 15) change = price * (0.02 + r() * 0.03);       // 延续强势
      else if (i < 20) change = (r() - 0.4) * price * 0.03;
      else change = (r() - 0.55) * price * 0.02;
      const open = price; const close = price + change;
      const high = Math.max(open, close) + r() * Math.abs(change) * 0.3;
      const low = Math.min(open, close) - r() * Math.abs(change) * 0.3;
      let vol = 40 + r() * 50;
      if (i === 8) vol *= 2.0;
      if (i === 9) vol *= 6.0;   // 地天板巨量
      if (i === 10) vol *= 3.0;  // 次日放量
      price = close;
      candles.push({ open, close, high, low, volume: vol, isUp: close >= open });
    }
  }
  // 默认游资数据
  else {
    for (let i = 0; i < 40; i++) {
      const change = (r() - 0.45) * price * 0.04;
      const open = price; const close = price + change;
      const high = Math.max(open, close) + r() * 2;
      const low = Math.min(open, close) - r() * 2;
      const vol = 50 + r() * 80;
      price = close;
      candles.push({ open, close, high, low, volume: vol, isUp: close >= open });
    }
  }

  return candles;
}

export default function StrategyChart({ strategy }: Props) {
  const data = useMemo(() => {
    const candles = strategy.category === 'hot-money' ? generateHotMoneyData(strategy.id) : generateData();
    const ma5 = calcMA(candles, 5);
    const ma10 = calcMA(candles, 10);
    const ma20 = calcMA(candles, 20);
    const ema12 = calcEMA(candles, 12);
    const ema26 = calcEMA(candles, 26);

    // MACD
    const dif: (number | null)[] = [];
    for (let i = 0; i < candles.length; i++) {
      if (ema12[i] !== null && ema26[i] !== null) {
        dif.push(ema12[i]! - ema26[i]!);
      } else {
        dif.push(null);
      }
    }
    const dea = calcEMAFromArray(dif, 9);
    const macdHist = dif.map((d, i) =>
      d !== null && dea[i] !== null ? d - dea[i]! : null
    );

    // RSI
    const rsi14 = calcRSI(candles, 14);

    // Bollinger Bands
    const bbUpper = candles.map((_, i) => {
      if (i < 19) return null;
      const m = ma20[i]!;
      let variance = 0;
      for (let j = i - 19; j <= i; j++) variance += (candles[j].close - m) ** 2;
      const std = Math.sqrt(variance / 20);
      return m + 2 * std;
    });
    const bbLower = candles.map((_, i) => {
      if (i < 19 || !ma20[i]) return null;
      const m = ma20[i]!;
      let variance = 0;
      for (let j = i - 19; j <= i; j++) variance += (candles[j].close - m) ** 2;
      const std = Math.sqrt(variance / 20);
      return m - 2 * std;
    });

    return { candles, ma5, ma10, ma20, dif, dea, macdHist, rsi14, bbUpper, bbLower };
  }, [strategy.id]);

  const { candles, ma5, ma10, ma20, dif, dea, macdHist, rsi14, bbUpper, bbLower } = data;

  // Category flags
  const isTrend = strategy.category === 'trend';
  const isOscillator = strategy.category === 'oscillator';
  const isVolume = strategy.category === 'volume';
  const isPattern = strategy.category === 'pattern';
  const isHotMoney = strategy.category === 'hot-money';

  const W = 700;
  const padL = 0;
  const padR = 0;
  const chartW = W - padL - padR;

  // Price chart: y 0~180
  const priceH = 180;
  const minP = Math.min(...candles.map((c) => c.low)) - 1;
  const maxP = Math.max(...candles.map((c) => c.high)) + 1;
  const pRange = maxP - minP || 1;
  const sy = (v: number) => priceH - ((v - minP) / pRange) * (priceH - 20);
  const candleW = chartW / candles.length;

  // Volume chart: y 190~250
  const volTop = 195;
  const volBot = 250;
  const maxVol = Math.max(...candles.map((c) => c.volume));
  const volH = (v: number) => volBot - (v / maxVol) * (volBot - volTop);

  // Sub chart: y 260~340
  const subTop = 260;
  const subBot = 330;

  // Signal arrows - generate buy/sell signals
  const signals: { index: number; type: 'buy' | 'sell' }[] = [];
  if (isHotMoney) {
    // 游资型：按策略逻辑生成信号
    const sid = strategy.id;
    if (sid === 'dragon-head') {
      signals.push({ index: 4, type: 'buy' });   // 首板买入
      signals.push({ index: 9, type: 'buy' });   // 二波启动
      signals.push({ index: 20, type: 'sell' });  // 退潮卖出
    } else if (sid === 'consecutive-board') {
      signals.push({ index: 5, type: 'buy' });   // 3板确认接力
      signals.push({ index: 7, type: 'buy' });   // 回封买入
      signals.push({ index: 10, type: 'sell' });  // 炸板卖出
    } else if (sid === 'weak-to-strong') {
      signals.push({ index: 7, type: 'buy' });   // 弱转强买入
      signals.push({ index: 16, type: 'sell' });  // 高位卖出
    } else if (sid === 'sentiment-cycle') {
      signals.push({ index: 7, type: 'buy' });   // 修复期买入
      signals.push({ index: 12, type: 'buy' });   // 升温加仓
      signals.push({ index: 19, type: 'sell' });  // 退潮卖出
    } else if (sid === 'pullback-reversal') {
      signals.push({ index: 7, type: 'buy' });   // 首阴低吸
      signals.push({ index: 8, type: 'buy' });   // 反包确认加仓
      signals.push({ index: 12, type: 'sell' });  // 二阴卖出
    } else if (sid === 'extreme-reversal') {
      signals.push({ index: 9, type: 'buy' });   // 地天板买入
      signals.push({ index: 18, type: 'sell' });  // 冲高卖出
    }
  } else {
    // 其他类型：MA交叉信号
    for (let i = 1; i < candles.length; i++) {
      if (ma5[i] !== null && ma5[i - 1] !== null && ma10[i] !== null && ma10[i - 1] !== null) {
        if (ma5[i - 1]! <= ma10[i - 1]! && ma5[i]! > ma10[i]!) {
          signals.push({ index: i, type: 'buy' });
        }
        if (ma5[i - 1]! >= ma10[i - 1]! && ma5[i]! < ma10[i]!) {
          signals.push({ index: i, type: 'sell' });
        }
      }
    }
  }

  // Build polyline from array
  const toLine = (arr: (number | null)[], scale: (v: number) => number) => {
    let d = '';
    arr.forEach((v, i) => {
      if (v === null) return;
      const x = padL + i * candleW + candleW / 2;
      d += (d ? 'L' : 'M') + `${x.toFixed(1)},${scale(v).toFixed(1)}`;
    });
    return d;
  };

  // MACD scale
  const macdMin = Math.min(...macdHist.filter((v) => v !== null).map((v) => v!), ...dif.filter((v) => v !== null).map((v) => v!), ...dea.filter((v) => v !== null).map((v) => v!));
  const macdMax = Math.max(...macdHist.filter((v) => v !== null).map((v) => v!), ...dif.filter((v) => v !== null).map((v) => v!), ...dea.filter((v) => v !== null).map((v) => v!));
  const macdRange = macdMax - macdMin || 1;
  const macdY = (v: number) => subBot - ((v - macdMin) / macdRange) * (subBot - subTop);

  // RSI scale
  const rsiMin = 0;
  const rsiMax = 100;
  const rsiY = (v: number) => subBot - ((v - rsiMin) / (rsiMax - rsiMin)) * (subBot - subTop);

  const totalH = 340;

  return (
    <div className="bg-card border border-border rounded-xl p-6 mb-10 kline-chart">
      {/* 标题和图例 */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="text-sm font-medium text-warm flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse-slow" />
          信号示意
        </h3>
        <div className="flex items-center gap-3 text-xs text-muted flex-wrap">
          {isTrend && (
            <>
              <span className="flex items-center gap-1"><span className="w-5 h-0.5 bg-yellow-400 rounded" />MA5</span>
              <span className="flex items-center gap-1"><span className="w-5 h-0.5 bg-blue-400 rounded" />MA10</span>
              <span className="flex items-center gap-1"><span className="w-5 h-0.5 bg-purple-400 rounded" />MA20</span>
              {strategy.id === 'bollinger' && (
                <>
                  <span className="flex items-center gap-1"><span className="w-5 h-0.5 border-t border-dashed border-accent/50" />BB上轨</span>
                  <span className="flex items-center gap-1"><span className="w-5 h-0.5 border-t border-dashed border-accent/50" />BB下轨</span>
                </>
              )}
              {strategy.id === 'ma-alignment' && (
                <span className="flex items-center gap-1"><span className="w-5 h-0.5 bg-orange-400 rounded" />MA60</span>
              )}
              {strategy.id === 'turtle-trading' && (
                <>
                  <span className="flex items-center gap-1"><span className="w-5 h-0.5 border-t border-dashed border-red-400/60" />20日高</span>
                  <span className="flex items-center gap-1"><span className="w-5 h-0.5 border-t border-dashed border-green-400/60" />20日低</span>
                </>
              )}
            </>
          )}
          {isOscillator && (
            <>
              <span className="flex items-center gap-1"><span className="w-5 h-0.5 bg-yellow-400 rounded" />MA5</span>
              <span className="flex items-center gap-1"><span className="w-5 h-0.5 bg-blue-400 rounded" />MA10</span>
            </>
          )}
          {isVolume && (
            <>
              <span className="flex items-center gap-1"><span className="w-5 h-0.5 bg-yellow-400 rounded" />MA5</span>
              <span className="flex items-center gap-1"><span className="w-5 h-0.5 bg-blue-400 rounded" />MA10</span>
              <span className="flex items-center gap-1"><span className="w-5 h-0.5 bg-accent rounded" />OBV</span>
              {strategy.id === 'volume-shrink-pullback' && (
                <>
                  <span className="flex items-center gap-1"><span className="w-5 h-0.5 bg-purple-400 rounded" />MA20</span>
                  <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 bg-amber-400 rounded-full" />缩量</span>
                </>
              )}
              {strategy.id === 'chip-distribution' && (
                <span className="flex items-center gap-1"><span className="inline-block w-3 h-2 bg-red-400/40 rounded-sm" />筹码</span>
              )}
            </>
          )}
          {isPattern && (
            <>
              <span className="flex items-center gap-1"><span className="w-5 h-0.5 bg-yellow-400 rounded" />MA5</span>
              <span className="flex items-center gap-1"><span className="w-5 h-0.5 bg-blue-400 rounded" />MA10</span>
              <span className="flex items-center gap-1"><span className="w-5 h-0.5 bg-rose-400 rounded" />颈线</span>
              {strategy.id === 'gap-trading' && (
                <span className="flex items-center gap-1"><span className="inline-block w-3 h-2 bg-red-400/30 rounded-sm" />缺口区</span>
              )}
              {strategy.id === 'trendline-breakout' && (
                <span className="flex items-center gap-1"><span className="w-5 h-0.5 border-t border-dashed border-amber-400/70" />趋势线</span>
              )}
            </>
          )}
          {isHotMoney && (
            <>
              <span className="flex items-center gap-1"><span className="w-5 h-0.5 bg-yellow-400 rounded" />MA5</span>
              <span className="flex items-center gap-1"><span className="w-5 h-0.5 bg-blue-400 rounded" />MA10</span>
              <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 bg-amber-400 rounded-sm" />涨停</span>
              <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 bg-cyan-400 rounded-sm" />跌停</span>
            </>
          )}
          <span className="flex items-center gap-1">
            <svg width="8" height="10"><polygon points="4,0 0,8 8,8" fill="#E74C5E" /></svg>
            买入
          </span>
          <span className="flex items-center gap-1">
            <svg width="8" height="10"><polygon points="4,10 0,2 8,2" fill="#00C9A7" /></svg>
            卖出
          </span>
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${totalH}`} className="w-full" style={{ height: totalH * 1.2 }}>
        <defs>
          <linearGradient id="volUpGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E74C5E" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#E74C5E" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="volDownGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00C9A7" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#00C9A7" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="bbFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00C9A7" stopOpacity="0.06" />
            <stop offset="50%" stopColor="#00C9A7" stopOpacity="0.02" />
            <stop offset="100%" stopColor="#00C9A7" stopOpacity="0.06" />
          </linearGradient>
        </defs>

        {/* 水平网格线 */}
        {[0.25, 0.5, 0.75].map((pct) => (
          <line key={pct} x1={padL} y1={sy(minP + pRange * pct)} x2={W} y2={sy(minP + pRange * pct)} stroke="#2A2A2A" strokeWidth="0.5" strokeDasharray="4,4" />
        ))}

        {/* K线 */}
        {candles.map((c, i) => {
          const x = padL + i * candleW;
          const bodyW = Math.max(candleW * 0.6, 2);
          const bx = x + (candleW - bodyW) / 2;
          return (
            <g key={i}>
              {/* 影线 */}
              <line
                x1={x + candleW / 2} y1={sy(c.high)}
                x2={x + candleW / 2} y2={sy(c.low)}
                stroke={c.isUp ? '#E74C5E' : '#00C9A7'}
                strokeWidth="1" opacity="0.7"
              />
              {/* 实体 */}
              <rect
                x={bx}
                y={sy(Math.max(c.open, c.close))}
                width={bodyW}
                height={Math.max(1, Math.abs(sy(c.close) - sy(c.open)))}
                fill={c.isUp ? '#E74C5E' : '#00C9A7'}
                rx="0.5"
                opacity={c.isUp ? 0.9 : 0.85}
              />
            </g>
          );
        })}

        {/* MA 均线 */}
        <path d={toLine(ma5, sy)} fill="none" stroke="#FACC15" strokeWidth="1.2" opacity="0.8" />
        <path d={toLine(ma10, sy)} fill="none" stroke="#60A5FA" strokeWidth="1.2" opacity="0.8" />
        {(isTrend || isPattern || isHotMoney) && (
          <path d={toLine(ma20, sy)} fill="none" stroke="#C084FC" strokeWidth="1.2" opacity="0.7" />
        )}

        {/* 均线多头排列 - MA60 */}
        {strategy.id === 'ma-alignment' && (() => {
          const ma60 = calcMA(candles, 20); // 用20模拟60效果
          return <path d={toLine(ma60, sy)} fill="none" stroke="#F97316" strokeWidth="1.5" opacity="0.7" />;
        })()}

        {/* 海龟交易法则 - 20日通道 + ATR止损线 */}
        {strategy.id === 'turtle-trading' && (() => {
          const high20: (number | null)[] = candles.map((_, i) => {
            if (i < 19) return null;
            return Math.max(...candles.slice(i - 19, i + 1).map(c => c.high));
          });
          const low20: (number | null)[] = candles.map((_, i) => {
            if (i < 19) return null;
            return Math.min(...candles.slice(i - 19, i + 1).map(c => c.low));
          });
          return (
            <g>
              <path d={toLine(high20, sy)} fill="none" stroke="#E74C5E" strokeWidth="1" strokeDasharray="6,3" opacity="0.6" />
              <path d={toLine(low20, sy)} fill="none" stroke="#00C9A7" strokeWidth="1" strokeDasharray="6,3" opacity="0.6" />
              <text x={padL + 2} y={15} fill="#E74C5E" fontSize="7" fontFamily="monospace" opacity="0.7">20D High</text>
              <text x={padL + 2} y={25} fill="#00C9A7" fontSize="7" fontFamily="monospace" opacity="0.7">20D Low</text>
            </g>
          );
        })()}

        {/* 缺口交易 - 缺口区域标注 */}
        {strategy.id === 'gap-trading' && (() => {
          const gaps: { i: number; top: number; bottom: number; type: 'up' | 'down' }[] = [];
          candles.forEach((c, i) => {
            if (i === 0) return;
            const prev = candles[i - 1];
            if (c.low > prev.high) gaps.push({ i, top: c.low, bottom: prev.high, type: 'up' });
            else if (c.high < prev.low) gaps.push({ i, top: prev.low, bottom: c.high, type: 'down' });
          });
          return (
            <g>
              {gaps.slice(0, 4).map((gap, idx) => {
                const x = padL + gap.i * candleW;
                const gapTop = sy(gap.top);
                const gapBot = sy(gap.bottom);
                const color = gap.type === 'up' ? '#E74C5E' : '#00C9A7';
                return (
                  <g key={`gap-${idx}`}>
                    <rect x={x - 2} y={gapTop} width={W - x + 2} height={Math.max(2, gapBot - gapTop)}
                      fill={color} opacity="0.08" />
                    <line x1={x} y1={gapTop} x2={x} y2={gapBot} stroke={color} strokeWidth="1.5" opacity="0.6" />
                    <text x={x + 3} y={gapTop + 8} fill={color} fontSize="7" fontFamily="monospace" opacity="0.8">
                      {gap.type === 'up' ? '↑缺口' : '↓缺口'}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })()}

        {/* 趋势线突破 - 上升趋势线 */}
        {strategy.id === 'trendline-breakout' && (() => {
          // 找到两个低点画上升趋势线
          const lows = candles.map((c, i) => ({ i, low: c.low }));
          let p1 = lows[3], p2 = lows[8];
          for (let i = 4; i < 8; i++) {
            if (lows[i].low < p2.low) p2 = lows[i];
          }
          const slope = (p2.low - p1.low) / (p2.i - p1.i);
          const y1 = sy(p1.low);
          const y2 = sy(p1.low + slope * (candles.length - 1 - p1.i));
          const x1 = padL + p1.i * candleW + candleW / 2;
          const x2 = padL + (candles.length - 1) * candleW + candleW;
          return (
            <g>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="6,3" opacity="0.7" />
              <text x={x2 - 40} y={y2 - 5} fill="#F59E0B" fontSize="7" fontFamily="monospace" opacity="0.8">趋势线</text>
            </g>
          );
        })()}

        {/* 筹码分布 - 侧面筹码图 */}
        {strategy.id === 'chip-distribution' && (() => {
          const priceBins = 8;
          const binSize = pRange / priceBins;
          const bins: { low: number; high: number; vol: number }[] = [];
          for (let b = 0; b < priceBins; b++) {
            const bLow = minP + b * binSize;
            const bHigh = bLow + binSize;
            const vol = candles.filter(c => c.close >= bLow && c.close < bHigh).reduce((s, c) => s + c.volume, 0);
            bins.push({ low: bLow, high: bHigh, vol });
          }
          const maxBinVol = Math.max(...bins.map(b => b.vol)) || 1;
          const barMaxW = 50;
          return (
            <g>
              {bins.map((bin, idx) => {
                const barW = (bin.vol / maxBinVol) * barMaxW;
                const y = sy((bin.low + bin.high) / 2);
                const isProfit = bin.high < candles[candles.length - 1].close;
                return (
                  <g key={`chip-${idx}`}>
                    <rect x={W - barW - 5} y={y - 3} width={barW} height={6}
                      fill={isProfit ? '#E74C5E' : '#00C9A7'} opacity="0.4" rx="1" />
                  </g>
                );
              })}
              <text x={W - barMaxW - 5} y={15} fill="#8A8A8A" fontSize="7" fontFamily="monospace" opacity="0.6">筹码分布</text>
            </g>
          );
        })()}

        {/* 布林带 */}
        {strategy.id === 'bollinger' && (
          <>
            <path d={toLine(bbUpper, sy)} fill="none" stroke="#00C9A7" strokeWidth="1" strokeDasharray="4,3" opacity="0.5" />
            <path d={toLine(bbLower, sy)} fill="none" stroke="#00C9A7" strokeWidth="1" strokeDasharray="4,3" opacity="0.5" />
            {/* Band fill */}
            {(() => {
              let fillD = '';
              const upperPts: string[] = [];
              const lowerPts: string[] = [];
              bbUpper.forEach((v, i) => {
                if (v === null || bbLower[i] === null) return;
                const x = (padL + i * candleW + candleW / 2).toFixed(1);
                upperPts.push(`${x},${sy(v).toFixed(1)}`);
                lowerPts.push(`${x},${sy(bbLower[i]!).toFixed(1)}`);
              });
              if (upperPts.length > 1) {
                fillD = 'M' + upperPts.join('L') + 'L' + lowerPts.reverse().join('L') + 'Z';
              }
              return fillD ? <path d={fillD} fill="url(#bbFill)" /> : null;
            })()}
          </>
        )}

        {/* 形态型 - 颈线 */}
        {isPattern && (() => {
          const mid = Math.floor(candles.length / 2);
          const necklineY = sy((candles[mid].high + candles[mid].low) / 2);
          return (
            <line x1={padL} y1={necklineY} x2={W} y2={necklineY}
              stroke="#E74C5E" strokeWidth="1" strokeDasharray="6,4" opacity="0.6" />
          );
        })()}

        {/* 量价型 - OBV 线叠加在成交量区域 */}
        {/* 缩量回调 - MA20 + 缩量标记 */}
        {strategy.id === 'volume-shrink-pullback' && (
          <>
            <path d={toLine(ma20, sy)} fill="none" stroke="#C084FC" strokeWidth="1.2" opacity="0.7" />
            {candles.map((c, i) => {
              if (i < 5 || c.isUp) return null; // 只标注下跌且缩量的K线
              const avgVol = candles.slice(Math.max(0, i - 5), i).reduce((s, cc) => s + cc.volume, 0) / Math.min(5, i);
              if (c.volume > avgVol * 0.6) return null; // 缩量标准
              const x = padL + i * candleW + candleW / 2;
              const y = volH(c.volume) - 4;
              return <circle key={`shrink-${i}`} cx={x} cy={y} r="2.5" fill="#F59E0B" opacity="0.7" />;
            })}
          </>
        )}

        {isVolume && (() => {
          const obv: number[] = [];
          let obvVal = 0;
          candles.forEach((c) => {
            obvVal += c.isUp ? c.volume : -c.volume;
            obv.push(obvVal);
          });
          const obvMin = Math.min(...obv);
          const obvMax = Math.max(...obv);
          const obvRange = obvMax - obvMin || 1;
          const obvScale = (v: number) => volBot - ((v - obvMin) / obvRange) * (volBot - volTop);
          let d = '';
          obv.forEach((v, i) => {
            const x = padL + i * candleW + candleW / 2;
            d += (d ? 'L' : 'M') + `${x.toFixed(1)},${obvScale(v).toFixed(1)}`;
          });
          return <path d={d} fill="none" stroke="#00C9A7" strokeWidth="1.5" opacity="0.8" />;
        })()}

        {/* 成交量柱 */}
        {candles.map((c, i) => {
          const x = padL + i * candleW;
          const barW = Math.max(candleW * 0.6, 2);
          const bx = x + (candleW - barW) / 2;
          return (
            <rect key={`vol-${i}`}
              x={bx} y={volH(c.volume)}
              width={barW} height={volBot - volH(c.volume)}
              fill={c.isUp ? 'url(#volUpGrad)' : 'url(#volDownGrad)'}
              rx="0.5"
            />
          );
        })}

        {/* 分隔线 */}
        <line x1={padL} y1={subTop - 8} x2={W} y2={subTop - 8} stroke="#2A2A2A" strokeWidth="0.5" />

        {/* 游资型 - 涨停/跌停标记 + 换手率副图 */}
        {isHotMoney && (() => {
          // 计算涨停/跌停标记
          const limitUpPct = 0.10; // 10%涨跌停
          const limitMarks: { i: number; type: 'up' | 'down' }[] = [];
          candles.forEach((c, i) => {
            if (i === 0) return;
            const prevClose = candles[i - 1].close;
            const pctChange = (c.close - prevClose) / prevClose;
            if (pctChange >= limitUpPct - 0.005) limitMarks.push({ i, type: 'up' });
            else if (pctChange <= -limitUpPct + 0.005) limitMarks.push({ i, type: 'down' });
          });

          // 计算换手率（模拟）
          const turnoverRates = candles.map((c) => {
            const base = 3 + Math.random() * 5;
            return c.isUp && (c.close - c.open) / c.open > 0.05 ? base * 2.5 : base;
          });
          const maxTurnover = Math.max(...turnoverRates);
          const trY = (v: number) => subBot - (v / maxTurnover) * (subBot - subTop);

          return (
            <g>
              {/* 涨停/跌停标记 */}
              {limitMarks.map(({ i, type }) => {
                const c = candles[i];
                const x = padL + i * candleW + candleW / 2;
                if (type === 'up') {
                  return (
                    <g key={`lm-${i}`}>
                      <rect
                        x={padL + i * candleW + 1}
                        y={sy(c.high) - 3}
                        width={candleW - 2}
                        height={6}
                        rx="1"
                        fill="#F59E0B"
                        opacity="0.8"
                      />
                      <text x={x} y={sy(c.high) - 5} textAnchor="middle" fill="#F59E0B" fontSize="6" fontFamily="monospace" opacity="0.9">ZT</text>
                    </g>
                  );
                } else {
                  return (
                    <g key={`lm-${i}`}>
                      <rect
                        x={padL + i * candleW + 1}
                        y={sy(c.low) - 3}
                        width={candleW - 2}
                        height={6}
                        rx="1"
                        fill="#22D3EE"
                        opacity="0.8"
                      />
                      <text x={x} y={sy(c.low) + 10} textAnchor="middle" fill="#22D3EE" fontSize="6" fontFamily="monospace" opacity="0.9">DT</text>
                    </g>
                  );
                }
              })}

              {/* 连板标记 */}
              {(() => {
                const boardCount: { start: number; end: number }[] = [];
                let inStreak = false;
                let streakStart = 0;
                limitMarks.forEach(({ i, type }, idx) => {
                  if (type === 'up') {
                    if (!inStreak) { inStreak = true; streakStart = i; }
                    if (idx === limitMarks.length - 1 || limitMarks[idx + 1].type !== 'up' || limitMarks[idx + 1].i !== i + 1) {
                      if (i - streakStart >= 1) boardCount.push({ start: streakStart, end: i });
                      inStreak = false;
                    }
                  } else {
                    inStreak = false;
                  }
                });
                return boardCount.map(({ start, end }) => {
                  const x1 = padL + start * candleW;
                  const x2 = padL + end * candleW + candleW;
                  const y = sy(Math.min(...candles.slice(start, end + 1).map(c => c.low))) + 16;
                  const count = end - start + 1;
                  return (
                    <g key={`board-${start}`}>
                      <line x1={x1} y1={y} x2={x2} y2={y} stroke="#F59E0B" strokeWidth="1.5" opacity="0.6" />
                      <rect x={(x1 + x2) / 2 - 10} y={y - 10} width={20} height={12} rx="3" fill="#F59E0B" opacity="0.85" />
                      <text x={(x1 + x2) / 2} y={y - 2} textAnchor="middle" fill="#0D0D0D" fontSize="7" fontFamily="monospace" fontWeight="bold">{count}连板</text>
                    </g>
                  );
                });
              })()}

              {/* 放量标记（游资关注点） */}
              {candles.map((c, i) => {
                if (c.volume < maxVol * 0.85 || !c.isUp) return null;
                const x = padL + i * candleW + candleW / 2;
                return (
                  <circle key={`hv-${i}`} cx={x} cy={volH(c.volume) - 4} r="2.5" fill="#F59E0B" opacity="0.7" />
                );
              })}

              {/* 换手率副图 */}
              {turnoverRates.map((tr, i) => {
                const x = padL + i * candleW;
                const barW = Math.max(candleW * 0.5, 1.5);
                const bx = x + (candleW - barW) / 2;
                const h = subBot - trY(tr);
                const isHighTurnover = tr > maxTurnover * 0.7;
                return (
                  <rect key={`tr-${i}`}
                    x={bx} y={trY(tr)}
                    width={barW} height={Math.max(0.5, h)}
                    fill={isHighTurnover ? '#F59E0B' : '#4B5563'}
                    opacity={isHighTurnover ? 0.6 : 0.3}
                    rx="0.3"
                  />
                );
              })}
              {/* 换手率均线 */}
              {(() => {
                const trMa = turnoverRates.map((_, i) => {
                  if (i < 4) return null;
                  let s = 0;
                  for (let j = i - 4; j <= i; j++) s += turnoverRates[j];
                  return s / 5;
                });
                let d = '';
                trMa.forEach((v, i) => {
                  if (v === null) return;
                  const x = padL + i * candleW + candleW / 2;
                  d += (d ? 'L' : 'M') + `${x.toFixed(1)},${trY(v).toFixed(1)}`;
                });
                return <path d={d} fill="none" stroke="#F59E0B" strokeWidth="1" opacity="0.7" />;
              })()}
              <text x={padL + 2} y={subTop + 2} fill="#8A8A8A" fontSize="8" fontFamily="monospace">换手率%</text>

              {/* 策略专属阶段标注 */}
              {(() => {
                const labelStyle = { fontSize: '8', fontFamily: 'monospace', opacity: '0.85' } as const;
                const labels: { i: number; text: string; color: string; bg: string }[] = [];

                if (strategy.id === 'dragon-head') {
                  labels.push({ i: 4, text: '首板', color: '#F59E0B', bg: '#78350F' });
                  labels.push({ i: 5, text: '龙头确认', color: '#E74C5E', bg: '#7F1D1D' });
                  labels.push({ i: 8, text: '分歧抗跌', color: '#60A5FA', bg: '#1E3A5F' });
                  labels.push({ i: 9, text: '二波', color: '#E74C5E', bg: '#7F1D1D' });
                } else if (strategy.id === 'consecutive-board') {
                  labels.push({ i: 3, text: '1板', color: '#F59E0B', bg: '#78350F' });
                  labels.push({ i: 5, text: '3板确认', color: '#E74C5E', bg: '#7F1D1D' });
                  labels.push({ i: 6, text: '分歧', color: '#60A5FA', bg: '#1E3A5F' });
                  labels.push({ i: 7, text: '回封', color: '#E74C5E', bg: '#7F1D1D' });
                  labels.push({ i: 10, text: '炸板', color: '#00C9A7', bg: '#064E3B' });
                } else if (strategy.id === 'weak-to-strong') {
                  labels.push({ i: 5, text: '首板', color: '#F59E0B', bg: '#78350F' });
                  labels.push({ i: 6, text: '炸板(弱)', color: '#00C9A7', bg: '#064E3B' });
                  labels.push({ i: 7, text: '弱转强!', color: '#E74C5E', bg: '#7F1D1D' });
                  labels.push({ i: 8, text: '强势延续', color: '#F59E0B', bg: '#78350F' });
                } else if (strategy.id === 'sentiment-cycle') {
                  labels.push({ i: 2, text: '冰点', color: '#60A5FA', bg: '#1E3A5F' });
                  labels.push({ i: 7, text: '修复', color: '#F59E0B', bg: '#78350F' });
                  labels.push({ i: 12, text: '升温', color: '#E74C5E', bg: '#7F1D1D' });
                  labels.push({ i: 16, text: '高潮', color: '#E74C5E', bg: '#7F1D1D' });
                  labels.push({ i: 19, text: '退潮', color: '#00C9A7', bg: '#064E3B' });
                } else if (strategy.id === 'pullback-reversal') {
                  labels.push({ i: 4, text: '首板', color: '#F59E0B', bg: '#78350F' });
                  labels.push({ i: 6, text: '3板', color: '#E74C5E', bg: '#7F1D1D' });
                  labels.push({ i: 7, text: '首阴!', color: '#00C9A7', bg: '#064E3B' });
                  labels.push({ i: 8, text: '反包!', color: '#E74C5E', bg: '#7F1D1D' });
                  labels.push({ i: 12, text: '二阴', color: '#60A5FA', bg: '#1E3A5F' });
                } else if (strategy.id === 'extreme-reversal') {
                  labels.push({ i: 8, text: '跌停!', color: '#00C9A7', bg: '#064E3B' });
                  labels.push({ i: 9, text: '地天板!', color: '#E74C5E', bg: '#7F1D1D' });
                  labels.push({ i: 10, text: '溢价', color: '#F59E0B', bg: '#78350F' });
                }

                return labels.map(({ i, text, color, bg }) => {
                  const x = padL + i * candleW + candleW / 2;
                  const c = candles[i];
                  const isUpLabel = c.isUp;
                  const y = isUpLabel ? sy(c.high) - 18 : sy(c.low) + 22;
                  const textW = text.length * 7 + 6;
                  return (
                    <g key={`label-${i}`}>
                      <rect x={x - textW / 2} y={y - 7} width={textW} height={14} rx="3" fill={bg} opacity="0.9" />
                      <text x={x} y={y + 3} textAnchor="middle" fill={color} {...labelStyle}>{text}</text>
                    </g>
                  );
                });
              })()}
            </g>
          );
        })()}

        {/* 副图 - MACD 或 RSI */}
        {isTrend && (
          <>
            {/* MACD 柱 */}
            {macdHist.map((v, i) => {
              if (v === null) return null;
              const x = padL + i * candleW;
              const barW = Math.max(candleW * 0.5, 1.5);
              const bx = x + (candleW - barW) / 2;
              const h = Math.abs(macdY(v) - macdY(0));
              return (
                <rect key={`mh-${i}`}
                  x={bx} y={v >= 0 ? macdY(v) : macdY(0)}
                  width={barW} height={Math.max(0.5, h)}
                  fill={v >= 0 ? '#E74C5E' : '#00C9A7'}
                  opacity="0.5" rx="0.3"
                />
              );
            })}
            {/* DIF & DEA */}
            <path d={toLine(dif, macdY)} fill="none" stroke="#FACC15" strokeWidth="1.2" opacity="0.8" />
            <path d={toLine(dea, macdY)} fill="none" stroke="#60A5FA" strokeWidth="1.2" opacity="0.8" />
            {/* 零轴 */}
            <line x1={padL} y1={macdY(0)} x2={W} y2={macdY(0)} stroke="#3A3A3A" strokeWidth="0.5" strokeDasharray="3,3" />
            <text x={padL + 2} y={subTop + 2} fill="#8A8A8A" fontSize="8" fontFamily="monospace">MACD</text>
          </>
        )}

        {isOscillator && (
          <>
            {/* RSI 线 */}
            <path d={toLine(rsi14, rsiY)} fill="none" stroke="#C084FC" strokeWidth="1.5" opacity="0.9" />
            {/* 超买超卖线 */}
            <line x1={padL} y1={rsiY(70)} x2={W} y2={rsiY(70)} stroke="#E74C5E" strokeWidth="0.5" strokeDasharray="4,3" opacity="0.5" />
            <line x1={padL} y1={rsiY(30)} x2={W} y2={rsiY(30)} stroke="#00C9A7" strokeWidth="0.5" strokeDasharray="4,3" opacity="0.5" />
            <line x1={padL} y1={rsiY(50)} x2={W} y2={rsiY(50)} stroke="#3A3A3A" strokeWidth="0.5" strokeDasharray="3,3" />
            {/* 超买超卖区填充 */}
            <rect x={padL} y={subTop} width={chartW} height={rsiY(70) - subTop} fill="#E74C5E" opacity="0.04" />
            <rect x={padL} y={rsiY(30)} width={chartW} height={subBot - rsiY(30)} fill="#00C9A7" opacity="0.04" />
            <text x={padL + 2} y={subTop + 2} fill="#8A8A8A" fontSize="8" fontFamily="monospace">RSI(14)</text>
            <text x={W - 18} y={rsiY(70) - 2} fill="#E74C5E" fontSize="7" fontFamily="monospace" opacity="0.6">70</text>
            <text x={W - 18} y={rsiY(30) + 8} fill="#00C9A7" fontSize="7" fontFamily="monospace" opacity="0.6">30</text>
          </>
        )}

        {isVolume && (
          <>
            {/* 量能均线 */}
            <path d={toLine(ma5.map((_, i) => {
              if (i < 4) return null;
              let s = 0;
              for (let j = i - 4; j <= i; j++) s += candles[j].volume;
              return s / 5;
            }), volH)} fill="none" stroke="#FACC15" strokeWidth="1" opacity="0.6" />
          </>
        )}

        {isPattern && (
          <>
            {/* 成交量确认 - 形态关键点高亮 */}
            {candles.map((c, i) => {
              if (c.volume > maxVol * 0.75) {
                const x = padL + i * candleW + candleW / 2;
                return (
                  <line key={`ph-${i}`} x1={x} y1={subTop} x2={x} y2={subBot}
                    stroke="#F0B90B" strokeWidth="0.3" opacity="0.2" />
                );
              }
              return null;
            })}
            <text x={padL + 2} y={subTop + 2} fill="#8A8A8A" fontSize="8" fontFamily="monospace">VOL</text>
          </>
        )}

        {/* 买卖信号箭头 */}
        {signals.map(({ index, type }) => {
          const x = padL + index * candleW + candleW / 2;
          const c = candles[index];
          if (type === 'buy') {
            const y = sy(c.low) + 10;
            return (
              <g key={`sig-${index}`}>
                <polygon points={`${x},${y - 8} ${x - 5},${y} ${x + 5},${y}`} fill="#E74C5E" opacity="0.9" />
                <text x={x} y={y - 11} textAnchor="middle" fill="#E74C5E" fontSize="7" fontFamily="monospace" opacity="0.7">B</text>
              </g>
            );
          } else {
            const y = sy(c.high) - 10;
            return (
              <g key={`sig-${index}`}>
                <polygon points={`${x},${y + 8} ${x - 5},${y} ${x + 5},${y}`} fill="#00C9A7" opacity="0.9" />
                <text x={x} y={y + 16} textAnchor="middle" fill="#00C9A7" fontSize="7" fontFamily="monospace" opacity="0.7">S</text>
              </g>
            );
          }
        })}

        {/* 最新价标线 */}
        {(() => {
          const lastC = candles[candles.length - 1];
          const lastY = sy(lastC.close);
          const lastX = padL + (candles.length - 1) * candleW + candleW;
          const lastColor = lastC.isUp ? '#E74C5E' : '#00C9A7';
          return (
            <>
              <line x1={padL} y1={lastY} x2={lastX} y2={lastY} stroke={lastColor} strokeWidth="0.5" strokeDasharray="2,2" opacity="0.3" />
              <rect x={lastX - 1} y={lastY - 6} width="36" height="12" rx="2" fill={lastColor} opacity="0.9" />
              <text x={lastX + 17} y={lastY + 3} textAnchor="middle" fill="#0D0D0D" fontSize="7" fontFamily="monospace" fontWeight="bold">
                {lastC.close.toFixed(1)}
              </text>
            </>
          );
        })()}
      </svg>
    </div>
  );
}

function calcEMAFromArray(arr: (number | null)[], period: number): (number | null)[] {
  const k = 2 / (period + 1);
  const result: (number | null)[] = [];
  let ema: number | null = null;
  let started = false;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === null) { result.push(null); continue; }
    if (!started) {
      started = true;
      ema = arr[i]!;
    } else {
      ema = arr[i]! * k + ema! * (1 - k);
    }
    result.push(ema);
  }
  return result;
}

function calcRSI(candles: Candle[], period: number): (number | null)[] {
  const result: (number | null)[] = [];
  let avgGain = 0;
  let avgLoss = 0;
  for (let i = 0; i < candles.length; i++) {
    if (i === 0) { result.push(null); continue; }
    const change = candles[i].close - candles[i - 1].close;
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? -change : 0;
    if (i <= period) {
      avgGain += gain;
      avgLoss += loss;
      if (i === period) {
        avgGain /= period;
        avgLoss /= period;
        const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
        result.push(100 - 100 / (1 + rs));
      } else {
        result.push(null);
      }
    } else {
      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      result.push(100 - 100 / (1 + rs));
    }
  }
  return result;
}
