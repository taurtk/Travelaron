import QRCode from 'qrcode';

class QRService {
  async generateBillSplitQR(billData) {
    const shareData = {
      type: 'bill_split',
      total: billData.total,
      people: billData.people,
      perPerson: billData.perPerson,
      timestamp: new Date().toISOString(),
      app: 'Travelaron'
    };

    const shareText = `💰 Bill Split - Travelaron
Total: ₹${billData.total}
People: ${billData.people.length}
Per Person: ₹${billData.perPerson.toFixed(2)}

Participants:
${billData.people.map(p => `• ${p.name}: ₹${p.amount.toFixed(2)}`).join('\n')}

Shared via Travelaron App`;

    return await this.generateQR(shareText, shareData);
  }

  async generateTripExpenseQR(tripData) {
    const total = tripData.reduce((sum, person) => sum + person.spent, 0);
    const settlements = this.calculateSettlements(tripData);

    const shareData = {
      type: 'trip_expenses',
      participants: tripData,
      total: total,
      settlements: settlements,
      timestamp: new Date().toISOString(),
      app: 'Travelaron'
    };

    const shareText = `✈️ Trip Expenses - Travelaron
Total Spent: ₹${total.toFixed(2)}
Participants: ${tripData.length}

Individual Spending:
${tripData.map(p => `• ${p.name}: ₹${p.spent.toFixed(2)}`).join('\n')}

${settlements.length > 0 ? `\nSettlements Needed:
${settlements.map(s => `• ${s.from} pays ${s.to}: ₹${s.amount.toFixed(2)}`).join('\n')}` : '\n🎉 Everyone is settled up!'}

Shared via Travelaron App`;

    return await this.generateQR(shareText, shareData);
  }

  async generateGambleResultQR(gambleData) {
    const shareData = {
      type: 'gamble_result',
      winner: gambleData.winner,
      participants: gambleData.participants,
      amount: gambleData.amount,
      timestamp: new Date().toISOString(),
      app: 'Travelaron'
    };

    const shareText = `🎲 Gamble Result - Travelaron
Amount: ₹${gambleData.amount.toFixed(2)}

🎯 ${gambleData.winner.name} pays the bill!

Participants:
${gambleData.participants.map(p => `• ${p.name}: ${p.lucky ? '😊 Lucky' : '💸 Pays All'}`).join('\n')}

Better luck next time! 😄
Shared via Travelaron App`;

    return await this.generateQR(shareText, shareData);
  }

  async generateQR(text, data) {
    try {
      // Generate QR code as data URL
      const qrDataURL = await QRCode.toDataURL(text, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      return {
        qrCode: qrDataURL,
        shareText: text,
        data: data
      };
    } catch (error) {
      console.error('QR generation failed:', error);
      return {
        qrCode: null,
        shareText: text,
        data: data
      };
    }
  }

  calculateSettlements(tripData) {
    const totalSpent = tripData.reduce((sum, person) => sum + person.spent, 0);
    const averageSpent = totalSpent / tripData.length;

    const balances = tripData.map(person => ({
      name: person.name,
      balance: person.spent - averageSpent,
    }));

    const debtors = balances.filter(p => p.balance < 0);
    const creditors = balances.filter(p => p.balance > 0);

    const settlements = [];
    let i = 0, j = 0;

    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];
      const amount = Math.min(-debtor.balance, creditor.balance);

      settlements.push({
        from: debtor.name,
        to: creditor.name,
        amount: amount,
      });

      debtor.balance += amount;
      creditor.balance -= amount;

      if (debtor.balance === 0) i++;
      if (creditor.balance === 0) j++;
    }

    return settlements;
  }

  async shareViaWebAPI(shareData) {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${shareData.data.type.replace('_', ' ').toUpperCase()} - Travelaron`,
          text: shareData.shareText,
          url: window.location.href
        });
        return true;
      } catch (error) {
        console.log('Web Share API failed:', error);
        return false;
      }
    }
    return false;
  }

  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Clipboard copy failed:', error);
      return false;
    }
  }

  downloadQR(qrDataURL, filename) {
    const link = document.createElement('a');
    link.download = filename;
    link.href = qrDataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export default new QRService();