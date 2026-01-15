import heapq

class ShippingQueue:
    """
    Manages outbound shipments using a Priority Queue (Max-Heap).
    Prioritizes:
    1. Expiring Goods (FEFO)
    2. Premium Customers
    3. High Value Orders
    """
    def __init__(self):
        self.heap = [] # List used as a Binary Heap
        self.entry_count = 0 # Tie-breaker for stable sorting

    def add_order(self, order_details):
        """
        Enqueue a new order with calculated priority.
        Priority Score = (Tier * 10) + (100 - Days_To_Expiry)
        """
        # Extract factors (Defaults used if missing for simulation stability)
        tier = order_details.get('tier', 1) 
        days_to_expiry = order_details.get('days_remaining', 30)
        
        # Calculate Score & Reason
        priority_reason = "Standard"
        priority_score = 0
        
        # 1. Critical: Expiring Soon (FEFO) - Highest Weight
        if days_to_expiry < 7:
            priority_score += 500  # Jump to top
            priority_reason = "Expiring Soon"
        
        # 2. Tier: Premium > VIP > Standard
        if tier == 3:
            priority_score += 50
            if priority_reason == "Standard": priority_reason = "Premium Customer"
        elif tier == 2:
            priority_score += 30
            if priority_reason == "Standard": priority_reason = "VIP Customer"
            
        # 3. Urgency fine-tuning
        priority_score += (100 - days_to_expiry)
        
        # Determine Status - Separate Blocked Orders
        status = order_details.get('status', 'PENDING')
        
        # Python's heapq is Min-Heap, so store negative score for Max-Heap behavior
        heapq.heappush(self.heap, (-priority_score, self.entry_count, {**order_details, 'priority_reason': priority_reason, 'priority_score': priority_score}))
        self.entry_count += 1
        
        print(f"[SMART BATCH] Order added: {order_details['order_id']} (Reason: {priority_reason}, Score: {priority_score})")

    def process_next_order(self):
        """Dequeue the highest priority order."""
        if not self.heap:
            return None
        
        priority, _, order = heapq.heappop(self.heap)
        return order
        
    def remove_order(self, order_id):
        """
        Removes an order by ID (e.g. when manually dispatched).
        Rebuilds the heap, which is O(N).
        """
        initial_len = len(self.heap)
        self.heap = [item for item in self.heap if item[2]['order_id'] != order_id]
        heapq.heapify(self.heap)
        
        if len(self.heap) < initial_len:
            print(f"[REMOVED] Order {order_id} removed manually.")
            return True
        return False
    
    def get_queue_status(self):
        # Return sorted list for viewing without popping
        # Heap elements are tuples: (-score, entry_count, order_details)
        # We sort by the tuple itself, which naturally sorts by -score (ascending), so largest score comes first in absolute terms
        
        # Verify status against DB logic or filtering
        # Since this is an in-memory queue, we should filter out any that might have been marked shipped externally if not removed
        # But properly, we'll just return what's in the heap.
        # The issue is likely that populated_queues loaded everything including SHIPPED, or they aren't being removed.
        
        sorted_heap = sorted(self.heap)
        raw_list = [item[2] for item in sorted_heap if item[2].get('status') != 'SHIPPED']
        return raw_list

    def get_optimized_pick_list(self):
        """
        Aggregates pending orders into a single Pick List using a Hash Map.
        O(N) operation to traverse the heap.
        """
        pick_map = {} # Hash Map: SKU -> Quantity
        
        for _, _, order in self.heap:
            if order.get('status') == 'SHIPPED':
                continue # Skip shipped orders in the pick list too
                
            sku = order.get('item_sku', 'UNKNOWN')
            qty = order.get('qty', 1)
            name = order.get('item_name', 'Unknown Item')
            
            if sku in pick_map:
                pick_map[sku]['qty'] += qty
            else:
                pick_map[sku] = {
                    'sku': sku, 
                    'name': name, 
                    'qty': qty,
                    'count': 1
                }
                
        return sorted(list(pick_map.values()), key=lambda x: x['qty'], reverse=True)


class BlockedQueue:
    """
    Manages orders that are blocked due to safety checks (recalled/expired/out of stock).
    """
    def __init__(self):
        self.blocked_orders = []

    def add_blocked_order(self, order_details, reason):
        self.blocked_orders.append({
            **order_details,
            'blocked_reason': reason,
            'status': 'BLOCKED'
        })
        print(f"[BLOCKED] Order {order_details['order_id']} blocked: {reason}")

    def get_blocked_list(self):
        return self.blocked_orders

    def resolve_order(self, order_id):
        # In a real app, this would re-validate and move to ShippingQueue
        self.blocked_orders = [o for o in self.blocked_orders if o['order_id'] != order_id]
        print(f"[RESOLVED] Blocked order {order_id} resolved/removed.")


class SafetyCheck:
    """
    Uses a Hash Set to instantly validate lot numbers.
    Prevents shipping of expired or recalled goods.
    """
    def __init__(self):
        # In a real app, this would load from a database (inventory_lots table)
        self.blocked_lots = set()

    def add_blocked_lot(self, lot_id):
        """Adds a lot number to the blacklist (recalled/expired)."""
        self.blocked_lots.add(lot_id)

    def is_lot_safe(self, lot_id):
        """O(1) check if a lot is safe to ship."""
        if lot_id in self.blocked_lots:
            return False
        return True
