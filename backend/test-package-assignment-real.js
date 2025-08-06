const { AppDataSource } = require('./dist/config/database.config');
const { Package } = require('./dist/database/entities/package.entity');
const { Event } = require('./dist/database/entities/event.entity');

async function testPackageAssignment() {
  try {
    await AppDataSource.initialize();
    
    const packageRepository = AppDataSource.getRepository(Package);
    const eventRepository = AppDataSource.getRepository(Event);
    
    // Get the event and its user
    const event = await eventRepository.findOne({
      where: { id: 'c7f578b4-e9c6-44e6-8666-efe24f171d5c' },
      relations: ['user']
    });
    
    console.log('Event user ID:', event.user.id);
    
    // Try to find packages for this user
    const packages = await packageRepository.find({
      where: { 
        id: ['59969229-c1fe-47b8-9cd0-3745b874a053', 'e2de3805-ab71-49d5-8dbc-75849af65e81'],
        user: { id: event.user.id },
        isActive: true
      }
    });
    
    console.log('Found packages for event user:', packages.length);
    console.log('Expected count: 2');
    
    // Try to find packages for the package owner
    const packagesForOwner = await packageRepository.find({
      where: { 
        id: ['59969229-c1fe-47b8-9cd0-3745b874a053', 'e2de3805-ab71-49d5-8dbc-75849af65e81'],
        user: { id: '047ab018-dd86-40b5-b4bd-fe5be46a3d26' },
        isActive: true
      }
    });
    
    console.log('Found packages for package owner:', packagesForOwner.length);
    
    await AppDataSource.destroy();
  } catch (error) {
    console.error('Error:', error);
  }
}

testPackageAssignment(); 