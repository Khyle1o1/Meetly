const { AppDataSource } = require('./dist/config/database.config');
const { Package } = require('./dist/database/entities/package.entity');
const { User } = require('./dist/database/entities/user.entity');

async function testDeletePackage() {
  try {
    await AppDataSource.initialize();
    
    const packageRepository = AppDataSource.getRepository(Package);
    const userRepository = AppDataSource.getRepository(User);
    
    // Get the package
    const package_ = await packageRepository.findOne({
      where: { id: '59969229-c1fe-47b8-9cd0-3745b874a053' },
      relations: ['user']
    });
    
    console.log('Package found:', {
      id: package_.id,
      name: package_.name,
      userId: package_.user?.id,
      userName: package_.user?.username
    });
    
    // Get an admin user
    const adminUser = await userRepository.findOne({
      where: { role: 'ADMIN' }
    });
    
    console.log('Admin user found:', {
      id: adminUser.id,
      username: adminUser.username,
      role: adminUser.role
    });
    
    // Test the service function directly
    const { deletePackageService } = require('./dist/services/package.service');
    
    try {
      await deletePackageService(adminUser.id, package_.id, 'ADMIN');
      console.log('✅ Package deleted successfully by admin');
    } catch (error) {
      console.log('❌ Error deleting package:', error.message);
    }
    
    await AppDataSource.destroy();
  } catch (error) {
    console.error('Error:', error);
  }
}

testDeletePackage(); 