export type HeapItem = {
  id: string
  ewp: number
  created_at: string
  [key: string]: any
}

export class MinHeap {
  private heap: HeapItem[]

  constructor() {
    this.heap = []
  }

  public push(item: HeapItem) {
    this.heap.push(item)
    this.bubbleUp(this.heap.length - 1)
  }

  public pop(): HeapItem | undefined {
    if (this.size() === 0) return undefined
    if (this.size() === 1) return this.heap.pop()

    const top = this.heap[0]
    this.heap[0] = this.heap.pop()!
    this.bubbleDown(0)
    return top
  }

  public peek(): HeapItem | undefined {
    return this.heap[0]
  }

  public size(): number {
    return this.heap.length
  }

  public clear() {
    this.heap = []
  }

  public getItems(): HeapItem[] {
    return [...this.heap]
  }

  public getSortedItems(): HeapItem[] {
    const tempHeap = new MinHeap()
    this.heap.forEach((item) => tempHeap.push(item))
    const sorted: HeapItem[] = []
    while (tempHeap.size() > 0) {
      sorted.push(tempHeap.pop()!)
    }
    return sorted
  }

  private bubbleUp(index: number) {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2)
      if (this.compare(index, parentIndex) < 0) {
        this.swap(index, parentIndex)
        index = parentIndex
      } else {
        break
      }
    }
  }

  private bubbleDown(index: number) {
    while (true) {
      const leftChild = 2 * index + 1
      const rightChild = 2 * index + 2
      let smallest = index

      if (
        leftChild < this.heap.length &&
        this.compare(leftChild, smallest) < 0
      ) {
        smallest = leftChild
      }

      if (
        rightChild < this.heap.length &&
        this.compare(rightChild, smallest) < 0
      ) {
        smallest = rightChild
      }

      if (smallest !== index) {
        this.swap(index, smallest)
        index = smallest
      } else {
        break
      }
    }
  }

  private compare(i: number, j: number): number {
    const a = this.heap[i]
    const b = this.heap[j]

    // 1. Compare EWP (Shortest Job First)
    if (a.ewp !== b.ewp) {
      return a.ewp - b.ewp
    }

    // 2. Tie-breaker: Timestamp (FIFO)
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  }

  private swap(i: number, j: number) {
    ;[this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]]
  }
}
