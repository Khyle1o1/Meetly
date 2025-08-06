const { AppDataSource } = require('./dist/config/database.config');
const { Event } = require('./dist/database/entities/event.entity');

async function checkEvents() {
  try {
    await AppDataSource.initialize();
    
    const eventRepository = AppDataSource.getRepository(Event);
    const events = await eventRepository.find({
      relations: ['user', 'packages']
    });
    
    console.log('Found events:', events.map(e => ({
      id: e.id,
      title: e.title,
      userId: e.user?.id,
      packageCount: e.packages?.length || 0
    })));
    
    await AppDataSource.destroy();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkEvents(); 