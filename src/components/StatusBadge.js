// StatusBadge.js
import { Badge } from 'react-bootstrap';

export const StatusBadge = ({ type, status }) => {
  if (!status) {
    console.error(`StatusBadge: Missing status for type ${type}`);
    return <Badge bg="secondary">Unknown</Badge>;
  }

  const getVariant = () => {
    if (type === 'payment') {
      return status === 'Success' ? 'success' 
           : status === 'Pending' ? 'warning' 
           : 'danger';
    } else { // order status
      return status === 'Delivered' ? 'success'
           : status === 'Shipped' ? 'primary'
           : status === 'Processing' ? 'warning'
           : status === 'Cancelled' ? 'danger'
           : 'secondary';
    }
  };

  return <Badge bg={getVariant()}>{status}</Badge>;
};