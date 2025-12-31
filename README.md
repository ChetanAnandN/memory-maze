# Virtual Memory Management Simulator

An interactive educational tool for understanding virtual memory concepts in operating systems. Built with React, TypeScript, and Vite.

![Virtual Memory Simulator](https://img.shields.io/badge/React-18.3-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue) ![Vite](https://img.shields.io/badge/Vite-5.0-purple)

## 🎯 Features

### 1. Page Replacement Algorithms
- **FIFO (First In, First Out)**: Replace the oldest page in memory
- **LRU (Least Recently Used)**: Replace the page unused for the longest time
- **Optimal (Bélády's Algorithm)**: Replace the page used farthest in the future
- Step-by-step visualization with play/pause controls
- Algorithm comparison charts

### 2. Address Translation
- Convert logical (virtual) addresses to physical addresses
- Interactive page table visualization
- Support for different page sizes (256B, 512B, 1KB, 4KB)
- Real-time calculation display

### 3. Demand Paging
- Visual simulation of page loading from disk to RAM
- Demonstrates lazy loading concept
- Interactive page request system
- Operation logging

### 4. Thrashing Monitor
- Simulates system behavior under memory pressure
- Visualizes relationship between page faults and CPU utilization
- Configurable process count, frame count, and working set size
- Real-time status indicators

### 5. TLB (Translation Lookaside Buffer) Simulation
- Demonstrates TLB caching mechanism
- Hit/miss tracking with statistics
- FIFO replacement policy
- Lookup history display

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Bun
- npm, yarn, or bun package manager

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd virtual-memory-simulator

# Install dependencies
npm install
# or
bun install

# Start development server
npm run dev
# or
bun dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
# or
bun run build
```

## 📦 Deployment to GitHub Pages

### Method 1: Using GitHub Actions (Recommended)

1. Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        env:
          BASE_URL: /${{ github.event.repository.name }}/
          
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

2. Update `vite.config.ts`:

```typescript
export default defineConfig({
  base: '/your-repo-name/',
  // ... rest of config
})
```

3. Push to main branch and the action will automatically deploy.

### Method 2: Manual Deployment

```bash
# Build the project
npm run build

# Deploy to gh-pages branch
npx gh-pages -d dist
```

## 🏗️ Project Structure

```
src/
├── components/
│   ├── simulator/
│   │   ├── VirtualMemorySimulator.tsx  # Main simulator component
│   │   ├── PageReplacementTab.tsx      # FIFO, LRU, Optimal demo
│   │   ├── AddressTranslationTab.tsx   # Address translation demo
│   │   ├── DemandPagingTab.tsx         # Demand paging demo
│   │   ├── ThrashingMonitorTab.tsx     # Thrashing visualization
│   │   ├── TLBSimulationTab.tsx        # TLB caching demo
│   │   ├── algorithms.ts               # Page replacement algorithms
│   │   └── types.ts                    # TypeScript interfaces
│   └── ui/                             # Reusable UI components
├── pages/
│   └── Index.tsx                       # Main page
├── index.css                           # Design system & styles
└── App.tsx                             # App routing
```

## 🎨 Customization

### Theming
The app supports dark/light mode. Customize colors in `src/index.css`:

```css
:root {
  --primary: 217 91% 60%;  /* Blue accent */
  --success: 142 76% 36%;  /* Green for hits */
  --destructive: 0 84% 60%; /* Red for faults */
}
```

### Adding New Algorithms
Extend `src/components/simulator/algorithms.ts`:

```typescript
export const simulateMyAlgorithm = (references: number[], frames: number[]) => {
  // Your algorithm implementation
  return { steps, faults, hits };
};
```

## 📚 Learning Objectives

After using this simulator, students should understand:

1. **Page Replacement**: How OS decides which page to evict when memory is full
2. **Address Translation**: How virtual addresses map to physical memory
3. **Demand Paging**: Why pages are loaded only when needed
4. **Thrashing**: What happens when there's insufficient memory
5. **TLB Caching**: How hardware speeds up address translation

## 🛠️ Technologies Used

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **Lucide React** - Icons
- **shadcn/ui** - UI components

## 📝 License

MIT License - feel free to use for educational purposes!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Happy Learning!** 🎓
